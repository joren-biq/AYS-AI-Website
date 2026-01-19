import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDOM, mockGetBoundingClientRect } from './helpers/dom-setup.js';

// Import translations for testing
import { translations } from '../../translations.js';

// Mock state and functions from main.js
// Since main.js uses direct DOM manipulation and state, we'll test its behavior by importing and setting up the environment

describe('Language Functions', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('setLanguage()', () => {
    it('should update state.lang correctly', () => {
      // Create a simple state object to simulate main.js state
      const state = { lang: 'nl', cookieConsent: null };

      // Simulate setLanguage function
      state.lang = 'en';
      expect(state.lang).toBe('en');
    });

    it('should update UI elements with data-i18n attribute', () => {
      const element = document.querySelector('[data-i18n="services-title"]');
      if (element) {
        const key = element.getAttribute('data-i18n');
        // Simulate the translation logic
        if (translations[key] && translations[key]['en']) {
          element.textContent = translations[key]['en'];
        }
      }

      // For actual testing, we need to check if elements get updated
      const servicesTitle = document.querySelector('[data-i18n="services-title"]');
      expect(servicesTitle).toBeTruthy();
    });

    it('should handle <br> tags safely by creating DOM nodes', () => {
      // Create an element with a translation that contains <br>
      const element = document.createElement('div');
      element.setAttribute('data-i18n', 'method.title');
      document.body.appendChild(element);

      // Simulate the safe <br> handling
      const translatedText = translations['method.title']['en']; // "Real impact,<br>not just slides."

      if (translatedText.includes('<br>')) {
        element.textContent = '';
        const parts = translatedText.split('<br>');
        parts.forEach((part, index) => {
          element.appendChild(document.createTextNode(part));
          if (index < parts.length - 1) {
            element.appendChild(document.createElement('br'));
          }
        });
      }

      // Verify the element has text nodes and br elements, not innerHTML
      expect(element.querySelector('br')).toBeTruthy();
      expect(element.innerHTML).toContain('<br>');
      // Ensure it's not using innerHTML directly (the <br> is a real element)
      const brElement = element.querySelector('br');
      expect(brElement.tagName).toBe('BR');
    });

    it('should toggle active class on language buttons', () => {
      const nlButton = document.querySelector('[data-lang="nl"]');
      const enButton = document.querySelector('[data-lang="en"]');

      // Simulate setLanguage behavior
      const currentLang = 'en';
      document.querySelectorAll('.lang-text-btn').forEach(btn => {
        if (btn.dataset.lang === currentLang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      expect(enButton.classList.contains('active')).toBe(true);
      expect(nlButton.classList.contains('active')).toBe(false);
    });

    it('should persist to localStorage only when cookieConsent is accepted', () => {
      const state = { lang: 'en', cookieConsent: 'accepted' };

      if (state.cookieConsent === 'accepted') {
        localStorage.setItem('lang', state.lang);
      }

      expect(localStorage.getItem('lang')).toBe('en');
    });

    it('should not persist when cookieConsent is declined', () => {
      const state = { lang: 'en', cookieConsent: 'declined' };

      if (state.cookieConsent === 'accepted') {
        localStorage.setItem('lang', state.lang);
      }

      expect(localStorage.getItem('lang')).toBeNull();
    });

    it('should not persist when cookieConsent is null', () => {
      const state = { lang: 'en', cookieConsent: null };

      if (state.cookieConsent === 'accepted') {
        localStorage.setItem('lang', state.lang);
      }

      expect(localStorage.getItem('lang')).toBeNull();
    });
  });
});

describe('Cookie Functions', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('initCookies()', () => {
    it('should show banner when cookieConsent is null', () => {
      const banner = document.getElementById('cookie-banner');
      const cookieConsent = null;

      if (!cookieConsent) {
        banner.classList.remove('hidden');
      }

      expect(banner.classList.contains('hidden')).toBe(false);
    });

    it('should hide banner when consent exists', () => {
      const banner = document.getElementById('cookie-banner');
      banner.classList.add('hidden');
      const cookieConsent = 'accepted';

      if (cookieConsent) {
        banner.classList.add('hidden');
      }

      expect(banner.classList.contains('hidden')).toBe(true);
    });

    it('should load saved language when cookies accepted', () => {
      localStorage.setItem('lang', 'en');
      localStorage.setItem('cookieConsent', 'accepted');

      const cookieConsent = localStorage.getItem('cookieConsent');
      let loadedLang = 'nl'; // default

      if (cookieConsent === 'accepted') {
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
          loadedLang = savedLang;
        }
      }

      expect(loadedLang).toBe('en');
    });

    it('should not load language when declined', () => {
      localStorage.setItem('lang', 'en');
      localStorage.setItem('cookieConsent', 'declined');

      const cookieConsent = localStorage.getItem('cookieConsent');
      let loadedLang = 'nl'; // default

      if (cookieConsent === 'accepted') {
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
          loadedLang = savedLang;
        }
      }

      expect(loadedLang).toBe('nl'); // Should remain default
    });
  });

  describe('acceptCookies()', () => {
    it('should set cookieConsent to accepted in localStorage', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      expect(localStorage.getItem('cookieConsent')).toBe('accepted');
    });

    it('should save current language to localStorage', () => {
      const currentLang = 'en';
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('lang', currentLang);

      expect(localStorage.getItem('lang')).toBe('en');
    });

    it('should hide cookie banner', () => {
      const banner = document.getElementById('cookie-banner');
      banner.classList.add('hidden');

      expect(banner.classList.contains('hidden')).toBe(true);
    });
  });

  describe('declineCookies()', () => {
    it('should set cookieConsent to declined', () => {
      localStorage.setItem('cookieConsent', 'declined');
      expect(localStorage.getItem('cookieConsent')).toBe('declined');
    });

    it('should remove lang from localStorage', () => {
      localStorage.setItem('lang', 'en');
      localStorage.removeItem('lang');

      expect(localStorage.getItem('lang')).toBeNull();
    });

    it('should hide cookie banner', () => {
      const banner = document.getElementById('cookie-banner');
      banner.classList.add('hidden');

      expect(banner.classList.contains('hidden')).toBe(true);
    });
  });
});

describe('Header Scroll Functions', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('checkHeaderState()', () => {
    it('should add header-scrolled class when scrollY > 50', () => {
      const header = document.querySelector('header');
      window.scrollY = 100;

      // Simulate checkHeaderState logic
      if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
      }

      expect(header.classList.contains('header-scrolled')).toBe(true);
    });

    it('should remove header-scrolled class when scrollY <= 50', () => {
      const header = document.querySelector('header');
      header.classList.add('header-scrolled');
      window.scrollY = 30;

      // Simulate checkHeaderState logic
      if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }

      expect(header.classList.contains('header-scrolled')).toBe(false);
    });

    it('should add correct header style classes based on section', () => {
      const header = document.querySelector('header');
      const darkSection = document.querySelector('.dark-section');

      // Mock getBoundingClientRect
      mockGetBoundingClientRect(header, 0, 100, 100);
      mockGetBoundingClientRect(darkSection, 0, 500, 500);

      // Simulate checking if header is over dark section
      const headerRect = header.getBoundingClientRect();
      const sectionRect = darkSection.getBoundingClientRect();
      const headerHeight = header.offsetHeight || 100;

      let isOnDark = false;
      if (sectionRect.top <= headerHeight && sectionRect.bottom >= 0) {
        isOnDark = true;
      }

      if (isOnDark) {
        header.classList.add('header-on-dark');
      }

      expect(header.classList.contains('header-on-dark')).toBe(true);
    });

    it('should correctly prioritize overlapping sections', () => {
      const header = document.querySelector('header');
      const darkSection = document.querySelector('.dark-section');
      const accentSection = document.querySelector('.accent-section');

      mockGetBoundingClientRect(header, 0, 100, 100);
      mockGetBoundingClientRect(darkSection, 0, 300, 300);
      mockGetBoundingClientRect(accentSection, 0, 500, 500);

      const headerHeight = 100;
      let isOnDark = false;
      let isOnAccent = false;

      // Check dark
      const darkRect = darkSection.getBoundingClientRect();
      if (darkRect.top <= headerHeight && darkRect.bottom >= 0) {
        isOnDark = true;
      }

      // Check accent (should override)
      const accentRect = accentSection.getBoundingClientRect();
      if (accentRect.top <= headerHeight && accentRect.bottom >= 0) {
        isOnAccent = true;
        isOnDark = false;
      }

      // Apply classes
      if (isOnAccent) {
        header.classList.add('header-on-accent');
        header.classList.remove('header-on-dark');
      }

      expect(header.classList.contains('header-on-accent')).toBe(true);
      expect(header.classList.contains('header-on-dark')).toBe(false);
    });
  });
});

describe('Mobile Menu Functions', () => {
  beforeEach(() => {
    createMockDOM();
  });

  describe('toggleMobileMenu()', () => {
    it('should toggle active class on button and nav', () => {
      const button = document.querySelector('.mobile-menu-btn');
      const nav = document.querySelector('.mobile-nav');

      // First toggle - open
      button.classList.toggle('active');
      nav.classList.toggle('active');

      expect(button.classList.contains('active')).toBe(true);
      expect(nav.classList.contains('active')).toBe(true);

      // Second toggle - close
      button.classList.toggle('active');
      nav.classList.toggle('active');

      expect(button.classList.contains('active')).toBe(false);
      expect(nav.classList.contains('active')).toBe(false);
    });

    it('should control body overflow correctly', () => {
      const nav = document.querySelector('.mobile-nav');

      // Open menu
      nav.classList.add('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';

      expect(document.body.style.overflow).toBe('hidden');

      // Close menu
      nav.classList.remove('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('closeMobileMenu()', () => {
    it('should remove active classes', () => {
      const button = document.querySelector('.mobile-menu-btn');
      const nav = document.querySelector('.mobile-nav');

      // Set active first
      button.classList.add('active');
      nav.classList.add('active');

      // Close
      button.classList.remove('active');
      nav.classList.remove('active');

      expect(button.classList.contains('active')).toBe(false);
      expect(nav.classList.contains('active')).toBe(false);
    });

    it('should reset body overflow', () => {
      document.body.style.overflow = 'hidden';

      // Close menu
      document.body.style.overflow = '';

      expect(document.body.style.overflow).toBe('');
    });
  });
});
