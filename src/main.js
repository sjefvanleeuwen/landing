import './scss/main.scss';
import './js/animations.js';
import './js/color-thief.js';

// Prevent Font Flickering (FOUT)
document.documentElement.classList.add('fonts-loading');

if ('fonts' in document) {
  document.fonts.ready.then(() => {
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
  });
} else {
  // Fallback for older browsers
  setTimeout(() => {
    document.documentElement.classList.remove('fonts-loading');
  }, 500);
}

console.log('Magazine Design System Loaded');
