import './scss/main.scss';
import './js/animations.js';
import './js/color-thief.js';
import './js/diagrams.js';
import { Router } from './js/router.js';
import { initCreator } from './js/creator.js';

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

// Initialize SPA Router
const routes = {
  'home': { template: 'home.html' },
  'blog': { template: 'blog.html' },
  'diagrams': { template: 'diagrams.html' },
  'about': { template: 'about.html' },
  'elements': { template: 'elements.html' },
  'neural-arch': { template: 'neural-arch.html' },
  'article-1': { template: 'article-1.html' },
  'article-2': { template: 'article-2.html' },
  'article-3': { template: 'article-3.html' },
  'article-4': { template: 'article-4.html' },
  'article-5': { template: 'article-5.html' },
  'article-6': { template: 'article-6.html' },
  'noise-floor': { template: 'noise-floor.html' },
  'creator': { template: 'creator.html' },
  '404': { template: '404.html' }
};

new Router(routes, 'app-root');

// Handle page-specific initializations
document.addEventListener('page-loaded', (e) => {
    if (e.detail.path === 'creator') {
        initCreator();
    }
});

console.log('Magazine Design System Loaded (SPA Mode)');
