// Main JavaScript file

// Header logic:
// 1. Default (CSS) is Normal + White text (Safe).
// 2. At Top (<50px) AND Not On Accent -> Add 'header-transparent' (mix-blend-mode: difference).
// 3. Scrolled (>50px) -> Add 'header-scrolled' (Background + Normal).
// 4. On Accent -> Force Normal + White.

const header = document.querySelector('header');
const partnersSection = document.getElementById('partners');

function checkHeaderState() {
  const scrollY = window.scrollY;
  let isOnAccent = false;

  if (partnersSection) {
    const rect = partnersSection.getBoundingClientRect();
    const headerHeight = header.offsetHeight;
    if (rect.top <= headerHeight && rect.bottom >= 0) {
      isOnAccent = true;
    }
  }

  // Handle Transparent/Difference Mode (Only at top, not on accent)
  if (scrollY <= 50 && !isOnAccent) {
    header.classList.add('header-transparent');
  } else {
    header.classList.remove('header-transparent');
  }

  // Handle Scrolled Mode
  if (scrollY > 50) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }

  // Handle Accent Mode (Force White)
  if (isOnAccent) {
    header.classList.add('header-on-accent');
  } else {
    header.classList.remove('header-on-accent');
  }
  
  // Clean up any inline styles from previous debugging
  header.style.mixBlendMode = '';
}

// Attach scroll listener
window.addEventListener('scroll', checkHeaderState);

// Initial check
checkHeaderState();

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});
