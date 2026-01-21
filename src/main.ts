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

// Router now uses convention-based routing (path -> path.html)
// Only define special overrides here
const routes: Record<string, RouteConfig> = {
  'home': { template: 'home.html' },
  'index': { template: 'home.html' },
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
