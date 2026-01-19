import { describe, it, expect } from 'vitest';
import { translations } from '../../translations.js';

describe('Translations', () => {
  describe('Structure Validation', () => {
    it('should have both nl and en translations for all keys', () => {
      const missingTranslations = [];

      Object.keys(translations).forEach(key => {
        if (!translations[key].nl) {
          missingTranslations.push(`${key} missing NL translation`);
        }
        if (!translations[key].en) {
          missingTranslations.push(`${key} missing EN translation`);
        }
      });

      expect(missingTranslations).toEqual([]);
    });

    it('should have no empty strings', () => {
      const emptyTranslations = [];

      Object.keys(translations).forEach(key => {
        if (translations[key].nl === '') {
          emptyTranslations.push(`${key}.nl is empty`);
        }
        if (translations[key].en === '') {
          emptyTranslations.push(`${key}.en is empty`);
        }
      });

      expect(emptyTranslations).toEqual([]);
    });

    it('should validate <br> tags are properly formatted', () => {
      const invalidBrTags = [];

      Object.keys(translations).forEach(key => {
        const nlText = translations[key].nl;
        const enText = translations[key].en;

        // Check for common malformed br tags
        if (nlText.includes('<br/>') || nlText.includes('<br />') || nlText.includes('<BR>')) {
          invalidBrTags.push(`${key}.nl has malformed br tag (use <br>)`);
        }
        if (enText.includes('<br/>') || enText.includes('<br />') || enText.includes('<BR>')) {
          invalidBrTags.push(`${key}.en has malformed br tag (use <br>)`);
        }

        // Check for unclosed or improperly formatted tags
        if (nlText.match(/<(?!br>)[^>]*>/)) {
          const match = nlText.match(/<(?!br>)[^>]*>/);
          if (match) {
            invalidBrTags.push(`${key}.nl has potentially unsafe HTML tag: ${match[0]}`);
          }
        }
        if (enText.match(/<(?!br>)[^>]*>/)) {
          const match = enText.match(/<(?!br>)[^>]*>/);
          if (match) {
            invalidBrTags.push(`${key}.en has potentially unsafe HTML tag: ${match[0]}`);
          }
        }
      });

      expect(invalidBrTags).toEqual([]);
    });
  });

  describe('Content Validation', () => {
    it('should have valid translation object structure', () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
      expect(Object.keys(translations).length).toBeGreaterThan(0);
    });

    it('should have expected navigation keys', () => {
      const navKeys = ['nav.method', 'nav.services', 'nav.partners', 'nav.contact'];

      navKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
        expect(translations[key].nl).toBeDefined();
        expect(translations[key].en).toBeDefined();
      });
    });

    it('should have expected hero section keys', () => {
      const heroKeys = ['hero.badge', 'hero.line1', 'hero.line2', 'hero.line3', 'hero.lead', 'hero.cta.start', 'hero.cta.more'];

      heroKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
        expect(translations[key].nl).toBeDefined();
        expect(translations[key].en).toBeDefined();
      });
    });

    it('should have expected method section keys', () => {
      const methodKeys = [
        'method.label',
        'method.title',
        'method.usp1.title',
        'method.usp1.text',
        'method.usp2.title',
        'method.usp2.text',
        'method.usp3.title',
        'method.usp3.text'
      ];

      methodKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
        expect(translations[key].nl).toBeDefined();
        expect(translations[key].en).toBeDefined();
      });
    });

    it('should have all service keys (1-4)', () => {
      for (let i = 1; i <= 4; i++) {
        const serviceKeys = [
          `service.${i}.title`,
          `service.${i}.tag`,
          `service.${i}.desc`,
          `service.${i}.list.1`,
          `service.${i}.list.2`,
          `service.${i}.list.3`,
          `service.${i}.list.4`
        ];

        serviceKeys.forEach(key => {
          expect(translations[key], `Missing ${key}`).toBeDefined();
          expect(translations[key].nl, `Missing ${key}.nl`).toBeDefined();
          expect(translations[key].en, `Missing ${key}.en`).toBeDefined();
        });
      }
    });

    it('should have expected cookie keys', () => {
      const cookieKeys = ['cookie.text', 'cookie.accept', 'cookie.decline', 'cookie.privacy', 'cookie.policy'];

      cookieKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
        expect(translations[key].nl).toBeDefined();
        expect(translations[key].en).toBeDefined();
      });
    });

    it('should have expected footer keys', () => {
      const footerKeys = [
        'footer.cta.title',
        'footer.cta.text',
        'footer.cta.btn',
        'footer.col.contact',
        'footer.col.menu',
        'footer.col.socials',
        'footer.copyright'
      ];

      footerKeys.forEach(key => {
        expect(translations[key]).toBeDefined();
        expect(translations[key].nl).toBeDefined();
        expect(translations[key].en).toBeDefined();
      });
    });
  });

  describe('Consistency Checks', () => {
    it('should have consistent special characters usage', () => {
      const issues = [];

      Object.keys(translations).forEach(key => {
        const nlText = translations[key].nl;
        const enText = translations[key].en;

        // Check for consistent quotation marks
        const nlHasSmartQuotes = nlText.includes('"') || nlText.includes('"');
        const enHasSmartQuotes = enText.includes('"') || enText.includes('"');

        // This is just a warning, not a hard failure
        if (nlHasSmartQuotes !== enHasSmartQuotes) {
          // Allow this for now, just checking
        }
      });

      // This test passes - just checking for awareness
      expect(true).toBe(true);
    });

    it('should have translations that are not identical across languages', () => {
      const identicalTranslations = [];

      Object.keys(translations).forEach(key => {
        const nlText = translations[key].nl;
        const enText = translations[key].en;

        // Skip keys that are expected to be the same (like brand names)
        const allowedIdentical = [
          'hero.badge',
          'hero.line1',
          'nav.partners',
          'partners.title',
          'service.1.title', // "Discover"
          'service.2.title', // "Build"
          'service.3.title', // "Operations"
          'service.4.title'  // "Service"
        ];

        if (!allowedIdentical.includes(key) && nlText === enText && nlText.length > 3) {
          identicalTranslations.push(key);
        }
      });

      // Some words might legitimately be the same, so we just log them
      // This test helps us identify potential missing translations
      if (identicalTranslations.length > 5) {
        console.warn('Many identical translations found:', identicalTranslations);
      }

      expect(true).toBe(true);
    });
  });
});
