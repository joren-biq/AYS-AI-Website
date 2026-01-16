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
  partnersSection: document.getElementById('partners')
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

  // Update Switcher State (Bold active)
  if (elements.langBtns) {
    elements.langBtns.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
        // btn.style.fontWeight = '800'; // Handled by CSS
      } else {
        btn.classList.remove('active');
      }
    });
  }

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
  let isOnAccent = false;

  if (elements.partnersSection) {
    const rect = elements.partnersSection.getBoundingClientRect();
    const headerHeight = elements.header.offsetHeight;
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnAccent = true;
    }
  }

  // Handle Transparent/Difference Mode (Only at top, not on accent)
  if (scrollY <= 50 && !isOnAccent) {
    elements.header.classList.add('header-transparent');
  } else {
    elements.header.classList.remove('header-transparent');
  }

  // Handle Scrolled Mode
  if (scrollY > 50) {
    elements.header.classList.add('header-scrolled');
  } else {
    elements.header.classList.remove('header-scrolled');
  }

  // Handle Accent Mode (Force White)
  if (isOnAccent) {
    elements.header.classList.add('header-on-accent');
  } else {
    elements.header.classList.remove('header-on-accent');
  }
  
  // Clean up
  elements.header.style.mixBlendMode = '';
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
});
