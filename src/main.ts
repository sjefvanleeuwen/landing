import './scss/main.scss';
import './js/animations';
import './js/color-thief';
import './js/diagrams';
import { Router } from './js/router';
import { initCreator } from './js/creator';
import { initCV } from './js/cv-fetcher';
import { initBlog } from './js/blog-fetcher';
import { initArticleViewer } from './js/article-viewer';
import { MagazineAudioPlayer, GlobalMiniPlayer } from './js/audio-component';

customElements.define('m-audio-player', MagazineAudioPlayer);
customElements.define('m-global-mini-player', GlobalMiniPlayer);

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
interface RouteConfig {
  template: string;
}

const routes: Record<string, RouteConfig> = {
  'home': { template: 'home.html' },
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
  'article-7': { template: 'article-7.html' },
  'article-8': { template: 'article-8.html' },
  'article-9': { template: 'article-9.html' },
  'noise-floor': { template: 'noise-floor.html' },
  'creator': { template: 'creator.html' },
  'cv': { template: 'cv.html' },
  'blog': { template: 'blog.html' },
  'journal': { template: 'journal.html' },
  'blog-backup': { template: 'blog-backup.html' },
  'article-viewer': { template: 'article-viewer.html' },
  'audio-test': { template: 'audio-test.html' },
  'city-lights': { template: 'city-lights.html' },
  '404': { template: '404.html' }
};

new Router(routes, 'app-root');

// Handle page-specific initializations
document.addEventListener('page-loaded', ((e: CustomEvent) => {
    if (e.detail.path === 'creator') {
        initCreator();
    }
    if (e.detail.path === 'cv') {
        initCV();
    }
    if (e.detail.path === 'journal') {
        initBlog();
    }
    if (e.detail.path === 'article-viewer') {
        initArticleViewer();
    }
}) as EventListener);

console.log('SJEF VAN LEEUWEN Design System Loaded (SPA Mode - TypeScript)');
