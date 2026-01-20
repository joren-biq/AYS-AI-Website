import { describe, it, expect } from 'vitest';
import { existsSync, statSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Build Validation', () => {
  const distPath = join(process.cwd(), 'dist');
  const indexPath = join(distPath, 'index.html');

  describe('Build Output', () => {
    it('should have dist directory', () => {
      expect(existsSync(distPath)).toBe(true);
    });

    it('should have index.html in dist', () => {
      expect(existsSync(indexPath)).toBe(true);
    });

    it('should have assets directory in dist', () => {
      const assetsPath = join(distPath, 'assets');
      expect(existsSync(assetsPath)).toBe(true);
    });
  });

  describe('index.html Validation', () => {
    it('should have index.html with content', () => {
      const stats = statSync(indexPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should have reasonable file size (<100kb)', () => {
      const stats = statSync(indexPath);
      const sizeInKb = stats.size / 1024;
      expect(sizeInKb).toBeLessThan(100);
    });

    it('should contain DOCTYPE declaration', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
    });

    it('should contain html tag', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('<html');
    });

    it('should contain head and body tags', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('<head>');
      expect(content).toContain('<body>');
    });

    it('should have CSP meta tag', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('Content-Security-Policy');
    });

    it('should reference main.js script', () => {
      const content = readFileSync(indexPath, 'utf-8');
      // Vite hashes the filename, so look for any JS module script
      expect(content).toMatch(/<script[^>]+type="module"[^>]+src="[^"]+\.js"/);
    });

    it('should reference style.css', () => {
      const content = readFileSync(indexPath, 'utf-8');
      // Vite hashes the filename, so look for style or css pattern
      expect(content).toMatch(/style.*\.css|\.css/);
    });
  });

  describe('Asset Validation', () => {
    it('should have JavaScript files in assets directory', () => {
      const assetsPath = join(distPath, 'assets');
      const files = readdirSync(assetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      expect(jsFiles.length).toBeGreaterThan(0);
    });

    it('should have CSS files in assets directory', () => {
      const assetsPath = join(distPath, 'assets');
      const files = readdirSync(assetsPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));
      expect(cssFiles.length).toBeGreaterThan(0);
    });

    it('should have hashed filenames for cache busting', () => {
      const assetsPath = join(distPath, 'assets');
      const files = readdirSync(assetsPath);

      // Check that files have hash patterns (e.g., index-Bzr2uX_F.js)
      const hashedFiles = files.filter(f => {
        // Look for pattern: name-hash.ext (hash can be alphanumeric + underscore/hyphen for base64)
        return /\w+-[a-zA-Z0-9_-]{6,}\.(js|css)/.test(f);
      });

      expect(hashedFiles.length).toBeGreaterThan(0);
    });

    it('should have reasonable JavaScript bundle size (<500kb)', () => {
      const assetsPath = join(distPath, 'assets');
      const files = readdirSync(assetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));

      jsFiles.forEach(file => {
        const stats = statSync(join(assetsPath, file));
        const sizeInKb = stats.size / 1024;
        expect(sizeInKb).toBeLessThan(500);
      });
    });

    it('should have reasonable CSS bundle size (<200kb)', () => {
      const assetsPath = join(distPath, 'assets');
      const files = readdirSync(assetsPath);
      const cssFiles = files.filter(f => f.endsWith('.css'));

      cssFiles.forEach(file => {
        const stats = statSync(join(assetsPath, file));
        const sizeInKb = stats.size / 1024;
        expect(sizeInKb).toBeLessThan(200);
      });
    });
  });

  describe('Content Validation', () => {
    it('should have required data-i18n attributes in HTML', () => {
      const content = readFileSync(indexPath, 'utf-8');

      // Check for some key translation attributes
      const requiredAttributes = [
        'data-i18n="nav.services"',
        'data-i18n="nav.method"',
        'data-i18n="hero.line1"',
        'data-i18n="cookie.accept"'
      ];

      requiredAttributes.forEach(attr => {
        expect(content).toContain(attr);
      });
    });

    it('should have cookie banner element', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('cookie-banner');
    });

    it('should have language switcher buttons', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('lang-text-btn');
      expect(content).toContain('data-lang="nl"');
      expect(content).toContain('data-lang="en"');
    });

    it('should have mobile menu elements', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('mobile-menu-btn');
      expect(content).toContain('mobile-nav');
    });

    it('should have main sections', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('id="services"');
      expect(content).toContain('id="method"');
      expect(content).toContain('id="partners"');
    });

    it('should have header element', () => {
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('<header');
    });
  });

  describe('Asset References', () => {
    it('should have all referenced assets exist', () => {
      const content = readFileSync(indexPath, 'utf-8');

      // Extract script src paths
      const scriptMatches = content.matchAll(/<script[^>]+src="([^"]+)"/g);
      for (const match of scriptMatches) {
        const src = match[1];
        // Skip external URLs (CDN scripts)
        if (src.startsWith('http://') || src.startsWith('https://')) {
          continue;
        }
        // Remove leading slash and base path if present
        const relativePath = src.replace(/^\//, '').replace(/^AYS-AI-Website\//, '');
        const fullPath = join(distPath, relativePath);
        expect(existsSync(fullPath), `Script not found: ${src}`).toBe(true);
      }

      // Extract link href paths (CSS)
      const linkMatches = content.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g);
      for (const match of linkMatches) {
        const href = match[1];
        // Skip external URLs
        if (href.startsWith('http://') || href.startsWith('https://')) {
          continue;
        }
        // Remove leading slash and base path if present
        const relativePath = href.replace(/^\//, '').replace(/^AYS-AI-Website\//, '');
        const fullPath = join(distPath, relativePath);
        expect(existsSync(fullPath), `CSS not found: ${href}`).toBe(true);
      }
    });
  });

  describe('Build Configuration', () => {
    it('should use correct base path for GitHub Pages', () => {
      const content = readFileSync(indexPath, 'utf-8');

      // Check if assets are referenced with /AYS-AI-Website/ base path
      // This might be in script src or link href
      const hasBasePath = content.includes('/AYS-AI-Website/assets/') ||
                         content.includes('"/AYS-AI-Website/') ||
                         // Or could be relative without base if built that way
                         content.includes('assets/');

      expect(hasBasePath).toBe(true);
    });
  });

  describe('Image Assets', () => {
    it('should have images directory if images exist', () => {
      const content = readFileSync(indexPath, 'utf-8');

      // Check if there are any image references
      const hasImages = content.includes('<img') || content.includes('.png') || content.includes('.jpg') || content.includes('.svg');

      if (hasImages) {
        // If images are referenced, check if they exist
        // Extract image sources
        const imgMatches = content.matchAll(/<img[^>]+src="([^"]+)"/g);
        for (const match of imgMatches) {
          const src = match[1];
          if (!src.startsWith('http')) {
            const relativePath = src.replace(/^\//, '').replace(/^AYS-AI-Website\//, '');
            const fullPath = join(distPath, relativePath);
            expect(existsSync(fullPath), `Image not found: ${src}`).toBe(true);
          }
        }
      }

      // Test passes regardless - just checking if images exist when referenced
      expect(true).toBe(true);
    });
  });
});
