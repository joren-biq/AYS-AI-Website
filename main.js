import { translations } from './translations.js';

// --- STATE MANAGEMENT ---
const state = {
  lang: 'nl', // Default
  cookieConsent: localStorage.getItem('cookieConsent') // null, 'accepted', 'declined'
};

// --- DOM ELEMENTS ---
const elements = {
  langBtns: document.querySelectorAll('.lang-text-btn'), // Changed from single toggle
  cookieBanner: document.getElementById('cookie-banner'),
  btnAccept: document.getElementById('cookie-accept'),
  btnDecline: document.getElementById('cookie-decline'),
  header: document.querySelector('header'),
  partnersSection: document.getElementById('partners'),
  mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
  mobileNav: document.querySelector('.mobile-nav')
};

// --- LANGUAGE LOGIC ---
function setLanguage(lang) {
  state.lang = lang;
  
  // Update UI Text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key] && translations[key][lang]) {
      // Use innerHTML for keys that might contain HTML (like <br>)
      if (key.includes('title') || key.includes('cta') || key.includes('desc')) {
         el.innerHTML = translations[key][lang];
      } else {
         el.textContent = translations[key][lang];
      }
    }
  });

  // Update Switcher State (Bold active) - both header and mobile nav
  document.querySelectorAll('.lang-text-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Persist if consented
  if (state.cookieConsent === 'accepted') {
    localStorage.setItem('lang', lang);
  }
}

// Remove toggleLanguage(), replace with specific listeners

// --- COOKIE LOGIC ---
function initCookies() {
  if (!state.cookieConsent) {
    // Show banner if no choice made
    if (elements.cookieBanner) elements.cookieBanner.classList.remove('hidden');
  } else if (state.cookieConsent === 'accepted') {
    // Load persisted language if accepted
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }
}

function acceptCookies() {
  state.cookieConsent = 'accepted';
  localStorage.setItem('cookieConsent', 'accepted');
  localStorage.setItem('lang', state.lang); // Save current lang immediately
  if (elements.cookieBanner) elements.cookieBanner.classList.add('hidden');
}

function declineCookies() {
  state.cookieConsent = 'declined';
  localStorage.setItem('cookieConsent', 'declined');
  // Clear any potential leftovers
  localStorage.removeItem('lang'); 
  if (elements.cookieBanner) elements.cookieBanner.classList.add('hidden');
}

// --- HEADER / SCROLL LOGIC ---
function checkHeaderState() {
  const scrollY = window.scrollY;
  const headerHeight = elements.header ? elements.header.offsetHeight : 100;

  // Get all sections to check which one the header is over
  const darkSections = document.querySelectorAll('.dark-section');
  const lightSections = document.querySelectorAll('.light-section');
  const accentSections = document.querySelectorAll('.accent-section');

  let isOnDark = false;
  let isOnLight = false;
  let isOnAccent = false;

  // Check dark sections (method section)
  darkSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnDark = true;
    }
  });

  // Check light sections (services)
  lightSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnLight = true;
      isOnDark = false;
    }
  });

  // Check accent sections (partners)
  accentSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnAccent = true;
      isOnDark = false;
      isOnLight = false;
    }
  });

  // Check footer-cta specifically (it's dark)
  const footerCta = document.querySelector('.footer-cta');
  if (footerCta) {
    const rect = footerCta.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnDark = true;
      isOnLight = false;
      isOnAccent = false;
    }
  }

  // Handle Scrolled Mode
  if (scrollY > 50) {
    elements.header.classList.add('header-scrolled');
  } else {
    elements.header.classList.remove('header-scrolled');
  }

  // Handle Dark Mode
  if (isOnDark) {
    elements.header.classList.add('header-on-dark');
  } else {
    elements.header.classList.remove('header-on-dark');
  }

  // Handle Light Mode
  if (isOnLight) {
    elements.header.classList.add('header-on-light');
  } else {
    elements.header.classList.remove('header-on-light');
  }

  // Handle Accent Mode
  if (isOnAccent) {
    elements.header.classList.add('header-on-accent');
  } else {
    elements.header.classList.remove('header-on-accent');
  }
}

// --- MOBILE MENU ---
function toggleMobileMenu() {
  if (elements.mobileMenuBtn && elements.mobileNav) {
    elements.mobileMenuBtn.classList.toggle('active');
    elements.mobileNav.classList.toggle('active');
    document.body.style.overflow = elements.mobileNav.classList.contains('active') ? 'hidden' : '';
  }
}

function closeMobileMenu() {
  if (elements.mobileMenuBtn && elements.mobileNav) {
    elements.mobileMenuBtn.classList.remove('active');
    elements.mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Init
  if (elements.langBtns) {
    elements.langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
      });
    });
  }
  
  // 2. Cookie Init
  initCookies();
  if (elements.btnAccept) elements.btnAccept.addEventListener('click', acceptCookies);
  if (elements.btnDecline) elements.btnDecline.addEventListener('click', declineCookies);

  // 3. Scroll Init
  window.addEventListener('scroll', checkHeaderState);
  checkHeaderState();

  // 4. Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 5. Mobile Menu
  if (elements.mobileMenuBtn) {
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile menu when clicking nav links
  if (elements.mobileNav) {
    elements.mobileNav.querySelectorAll('.mobile-nav-links a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Also handle lang buttons in mobile nav
    elements.mobileNav.querySelectorAll('.mobile-nav-lang .lang-text-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
      });
    });
  }

  // 6. Handle anchor navigation for sticky sections
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Temporarily remove sticky positioning from all sections
        const sections = document.querySelectorAll('.section-card');
        sections.forEach(section => {
          section.style.position = 'relative';
        });

        // Scroll to target
        targetElement.scrollIntoView({ behavior: 'smooth' });

        // Restore sticky positioning after scroll completes
        setTimeout(() => {
          sections.forEach(section => {
            section.style.position = '';
          });
        }, 800);
      }
    });
  });
});
