import { beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Setup function to be called before each test
beforeEach(() => {
  // Clear localStorage before each test
  localStorageMock.clear();

  // Mock global objects that happy-dom might not provide
  global.localStorage = localStorageMock;

  // Mock window.scrollY
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0
  });

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = () => {};
});

// Cleanup after each test
afterEach(() => {
  // Clear the document body
  document.body.innerHTML = '';

  // Clear localStorage
  localStorageMock.clear();

  // Reset scrollY
  window.scrollY = 0;
});

/**
 * Helper function to create a mock DOM structure for testing
 */
export function createMockDOM() {
  document.body.innerHTML = `
    <header>
      <div class="lang-text-btn" data-lang="nl">NL</div>
      <div class="lang-text-btn" data-lang="en">EN</div>
      <button class="mobile-menu-btn"></button>
    </header>

    <div id="cookie-banner" class="hidden">
      <button id="cookie-accept">Accept</button>
      <button id="cookie-decline">Decline</button>
    </div>

    <div class="mobile-nav">
      <div class="mobile-nav-links">
        <a href="#services">Services</a>
        <a href="#method">Method</a>
      </div>
      <div class="mobile-nav-lang">
        <div class="lang-text-btn" data-lang="nl">NL</div>
        <div class="lang-text-btn" data-lang="en">EN</div>
      </div>
    </div>

    <section id="services" class="section-card light-section">
      <h2 data-i18n="services-title">Services</h2>
    </section>

    <section id="method" class="section-card dark-section">
      <h2 data-i18n="method-title">Method</h2>
    </section>

    <section id="partners" class="section-card accent-section">
      <h2 data-i18n="partners-title">Partners</h2>
    </section>

    <div class="footer-cta">
      <p data-i18n="cta-text">CTA</p>
    </div>
  `;
}

/**
 * Helper to get mock element bounds
 */
export function mockGetBoundingClientRect(element, top, bottom, height) {
  element.getBoundingClientRect = () => ({
    top,
    bottom,
    height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top
  });
}
