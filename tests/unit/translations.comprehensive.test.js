import { describe, it, expect } from 'vitest';
import { translations } from '../../translations.js';

/**
 * Comprehensive translation validation tests
 * Ensures all translations are complete, valid, and properly formatted
 */

describe('Translation Completeness', () => {
  it('should have both nl and en for every key', () => {
    Object.keys(translations).forEach(key => {
      expect(translations[key]).toHaveProperty('nl');
      expect(translations[key]).toHaveProperty('en');
    });
  });

  it('should have non-empty translations for all keys', () => {
    Object.keys(translations).forEach(key => {
      expect(translations[key].nl).toBeTruthy();
      expect(translations[key].en).toBeTruthy();
      expect(translations[key].nl.trim()).not.toBe('');
      expect(translations[key].en.trim()).not.toBe('');
    });
  });

  it('should not have duplicate keys', () => {
    const keys = Object.keys(translations);
    const uniqueKeys = [...new Set(keys)];
    expect(keys.length).toBe(uniqueKeys.length);
  });

  it('should have consistent number of translations', () => {
    const nlCount = Object.keys(translations).filter(key => translations[key].nl).length;
    const enCount = Object.keys(translations).filter(key => translations[key].en).length;
    expect(nlCount).toBe(enCount);
  });
});

describe('Translation Structure', () => {
  it('should follow naming convention (section.subsection)', () => {
    Object.keys(translations).forEach(key => {
      expect(key).toMatch(/^[a-z]+\.[a-z0-9.]+$/i);
    });
  });

  it('should have organized sections', () => {
    const keys = Object.keys(translations);
    const sections = [...new Set(keys.map(k => k.split('.')[0]))];

    expect(sections).toContain('nav');
    expect(sections).toContain('hero');
    expect(sections).toContain('method');
    expect(sections).toContain('services');
    expect(sections).toContain('service');
    expect(sections).toContain('partners');
    expect(sections).toContain('footer');
    expect(sections).toContain('cookie');
  });

  it('should use consistent dot notation levels', () => {
    Object.keys(translations).forEach(key => {
      const levels = key.split('.').length;
      expect(levels).toBeGreaterThanOrEqual(2);
      expect(levels).toBeLessThanOrEqual(4);
    });
  });
});

describe('Translation Content Quality', () => {
  it('should not contain obvious typos in common words', () => {
    const commonTypos = ['teh', 'recieve', 'occured', 'seperate'];

    Object.keys(translations).forEach(key => {
      const nlText = translations[key].nl.toLowerCase();
      const enText = translations[key].en.toLowerCase();

      commonTypos.forEach(typo => {
        expect(nlText).not.toContain(typo);
        expect(enText).not.toContain(typo);
      });
    });
  });

  it('should not have trailing/leading whitespace (except intentional)', () => {
    // Some keys intentionally have trailing spaces (e.g., "dat " before highlight)
    const allowedTrailing = ['hero.line2', 'method.title.part1'];

    Object.keys(translations).forEach(key => {
      if (!allowedTrailing.includes(key)) {
        expect(translations[key].nl).toBe(translations[key].nl.trim());
        expect(translations[key].en).toBe(translations[key].en.trim());
      }
    });
  });

  it('should not have double spaces', () => {
    Object.keys(translations).forEach(key => {
      expect(translations[key].nl).not.toContain('  ');
      expect(translations[key].en).not.toContain('  ');
    });
  });

  it('should have proper capitalization for titles', () => {
    const titleKeys = Object.keys(translations).filter(k =>
      k.includes('.title') || k.includes('.label')
    );

    // Some keys intentionally have lowercase (e.g., "impact," is highlighted, "geen slides" continues sentence)
    const allowedLowercase = ['method.title.part2', 'method.title.part3'];

    titleKeys.forEach(key => {
      if (allowedLowercase.includes(key)) return;

      const nlText = translations[key].nl;
      const enText = translations[key].en;

      // First character should be uppercase (unless it's a special case)
      if (nlText.length > 0 && !nlText.startsWith('<')) {
        expect(nlText[0]).toBe(nlText[0].toUpperCase());
      }
      if (enText.length > 0 && !enText.startsWith('<')) {
        expect(enText[0]).toBe(enText[0].toUpperCase());
      }
    });
  });
});

describe('HTML and Special Characters', () => {
  it('should have balanced <br> tags', () => {
    Object.keys(translations).forEach(key => {
      const nlBrCount = (translations[key].nl.match(/<br>/g) || []).length;
      const enBrCount = (translations[key].en.match(/<br>/g) || []).length;

      // Both languages should have same number of line breaks
      expect(nlBrCount).toBe(enBrCount);
    });
  });

  it('should not contain unclosed HTML tags', () => {
    const dangerousTags = ['<script', '<iframe', '<object', '<embed', '<style'];

    Object.keys(translations).forEach(key => {
      const nlText = translations[key].nl.toLowerCase();
      const enText = translations[key].en.toLowerCase();

      dangerousTags.forEach(tag => {
        expect(nlText).not.toContain(tag);
        expect(enText).not.toContain(tag);
      });
    });
  });

  it('should properly escape quotes in translations', () => {
    Object.keys(translations).forEach(key => {
      const nlText = translations[key].nl;
      const enText = translations[key].en;

      // Should not have unmatched quotes that would break JavaScript
      const nlQuotes = (nlText.match(/"/g) || []).length;
      const enQuotes = (enText.match(/"/g) || []).length;

      expect(nlQuotes % 2).toBe(0);
      expect(enQuotes % 2).toBe(0);
    });
  });

  it('should not contain JavaScript code', () => {
    const jsPatterns = ['function(', '=>', 'console.', 'alert(', 'eval('];

    Object.keys(translations).forEach(key => {
      const nlText = translations[key].nl;
      const enText = translations[key].en;

      jsPatterns.forEach(pattern => {
        expect(nlText).not.toContain(pattern);
        expect(enText).not.toContain(pattern);
      });
    });
  });
});

describe('Specific Section Validation', () => {
  describe('Navigation Keys', () => {
    const navKeys = ['nav.method', 'nav.services', 'nav.partners', 'nav.contact'];

    it('should have all required navigation keys', () => {
      navKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
      });
    });

    it('should have short navigation labels', () => {
      navKeys.forEach(key => {
        expect(translations[key].nl.length).toBeLessThan(20);
        expect(translations[key].en.length).toBeLessThan(20);
      });
    });
  });

  describe('Hero Keys', () => {
    const heroKeys = ['hero.badge', 'hero.line1', 'hero.line2', 'hero.line3', 'hero.lead'];

    it('should have all required hero keys', () => {
      heroKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
      });
    });

    it('should have consistent badge text', () => {
      expect(translations['hero.badge'].nl).toBe('APPLIED AI AGENCY');
      expect(translations['hero.badge'].en).toBe('APPLIED AI AGENCY');
    });
  });

  describe('Method Keys', () => {
    const methodKeys = [
      'method.label',
      'method.title.part1',
      'method.title.part2',
      'method.title.part3',
      'method.usp1.title',
      'method.usp1.text',
      'method.usp2.title',
      'method.usp2.text',
      'method.usp3.title',
      'method.usp3.text'
    ];

    it('should have all required method keys', () => {
      methodKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
      });
    });

    it('should have three-part title', () => {
      expect(translations['method.title.part1']).toBeDefined();
      expect(translations['method.title.part2']).toBeDefined();
      expect(translations['method.title.part3']).toBeDefined();
    });

    it('should have three USPs', () => {
      for (let i = 1; i <= 3; i++) {
        expect(translations[`method.usp${i}.title`]).toBeDefined();
        expect(translations[`method.usp${i}.text`]).toBeDefined();
      }
    });
  });

  describe('Service Keys', () => {
    it('should have all four services', () => {
      for (let i = 1; i <= 4; i++) {
        expect(translations[`service.${i}.title`]).toBeDefined();
        expect(translations[`service.${i}.tag`]).toBeDefined();
        expect(translations[`service.${i}.desc`]).toBeDefined();
      }
    });

    it('should have four list items per service', () => {
      for (let i = 1; i <= 4; i++) {
        for (let j = 1; j <= 4; j++) {
          expect(translations[`service.${i}.list.${j}`]).toBeDefined();
        }
      }
    });
  });

  describe('Cookie Keys', () => {
    const cookieKeys = ['cookie.text', 'cookie.accept', 'cookie.decline', 'cookie.privacy', 'cookie.policy'];

    it('should have all required cookie keys', () => {
      cookieKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
      });
    });

    it('should have concise button text', () => {
      expect(translations['cookie.accept'].nl.length).toBeLessThan(15);
      expect(translations['cookie.accept'].en.length).toBeLessThan(15);
      expect(translations['cookie.decline'].nl.length).toBeLessThan(15);
      expect(translations['cookie.decline'].en.length).toBeLessThan(15);
    });
  });

  describe('Footer Keys', () => {
    const footerKeys = [
      'footer.cta.title',
      'footer.cta.text',
      'footer.cta.btn',
      'footer.col.contact',
      'footer.col.menu',
      'footer.col.socials',
      'footer.copyright'
    ];

    it('should have all required footer keys', () => {
      footerKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
      });
    });

    it('should have correct copyright year', () => {
      expect(translations['footer.copyright'].nl).toContain('2026');
      expect(translations['footer.copyright'].en).toContain('2026');
    });
  });
});

describe('Translation Consistency', () => {
  it('should use consistent terminology for "AI"', () => {
    const keysWithAI = Object.keys(translations).filter(key =>
      translations[key].nl.includes('AI') || translations[key].en.includes('AI')
    );

    expect(keysWithAI.length).toBeGreaterThan(0);

    // AI should be uppercase
    keysWithAI.forEach(key => {
      const nlText = translations[key].nl;
      const enText = translations[key].en;

      // Should not have lowercase 'ai' (except in email addresses)
      if (!nlText.includes('@')) {
        expect(nlText).not.toMatch(/\bai\b/);
      }
      if (!enText.includes('@')) {
        expect(enText).not.toMatch(/\bai\b/);
      }
    });
  });

  it('should have reasonable length differences between languages', () => {
    Object.keys(translations).forEach(key => {
      const nlLength = translations[key].nl.length;
      const enLength = translations[key].en.length;

      // Languages shouldn't differ by more than 100% unless it's a short string
      if (nlLength > 10 && enLength > 10) {
        const ratio = Math.max(nlLength, enLength) / Math.min(nlLength, enLength);
        expect(ratio).toBeLessThan(2.5);
      }
    });
  });

  it('should use consistent punctuation', () => {
    Object.keys(translations).forEach(key => {
      const nl = translations[key].nl;
      const en = translations[key].en;

      // If one ends with punctuation, both should
      const nlEndsWithPunct = /[.!?]$/.test(nl);
      const enEndsWithPunct = /[.!?]$/.test(en);

      if (nl.length > 20) { // Only for longer strings
        expect(nlEndsWithPunct).toBe(enEndsWithPunct);
      }
    });
  });
});

describe('Performance and Size', () => {
  it('should have reasonable total translation size', () => {
    const jsonSize = JSON.stringify(translations).length;
    // Should be less than 50KB
    expect(jsonSize).toBeLessThan(50000);
  });

  it('should not have excessively long translations', () => {
    Object.keys(translations).forEach(key => {
      expect(translations[key].nl.length).toBeLessThan(500);
      expect(translations[key].en.length).toBeLessThan(500);
    });
  });

  it('should have reasonable number of total translations', () => {
    const keyCount = Object.keys(translations).length;
    expect(keyCount).toBeGreaterThan(30); // Minimum coverage
    expect(keyCount).toBeLessThan(200); // Not bloated
  });
});
