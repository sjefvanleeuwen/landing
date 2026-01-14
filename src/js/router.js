import { initDynamicTheming } from './color-thief.js';

/**
 * Simple Vanilla SPA Router
 */
export class Router {
  constructor(routes, containerId) {
    this.routes = routes;
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Disable automatic browser scroll restoration for a true SPA feel
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Intercept clicks on links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href.includes(window.location.origin) && !link.hasAttribute('data-no-route')) {
        const url = new URL(link.href);
        // If it's a relative path to an html file, convert to hash
        if (url.pathname.endsWith('.html') && !url.hash) {
          e.preventDefault();
          
          // Force scroll to top immediately on click
          window.scrollTo({ top: 0, behavior: 'instant' });
          
          // Get just the filename (e.g., 'about.html' -> 'about')
          const filename = url.pathname.split('/').pop().replace('.html', '');
          const route = filename === 'index' ? 'home' : filename;
          window.location.hash = `#/${route === 'home' ? '' : route}`;
        }
      }
    });
  }

  async handleRoute() {
    // 1. Immediately scroll to top when navigation begins
    window.scrollTo(0, 0);

    let path = window.location.hash.slice(2) || 'home';
    if (path === '') path = 'home';

    const route = this.routes[path] || this.routes['404'] || this.routes['home'];
    
    try {
      this.container.classList.add('loading');
      const response = await fetch(route.template);
      const html = await response.text();
      
      // Extract only the content from the body of the fetched file if it's a full HTML page
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Usually our subpages have a <div class="sub-page"> or <div class="article-page">
      const content = doc.querySelector('.sub-page, .article-page, .landing-page') || doc.body;
      
      // Remove any navigation or footer from injected content as we have global versions
      const injectedNav = content.querySelector('m-nav');
      if (injectedNav) injectedNav.remove();

      const injectedFooter = content.querySelector('footer, m-footer');
      if (injectedFooter) injectedFooter.remove();
      
      this.container.innerHTML = content.innerHTML;
      this.container.className = content.className; // Maintain page-specific styling
      
      // Clear previous data attributes
      Array.from(this.container.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          this.container.removeAttribute(attr.name);
        }
      });

      // Transfer data attributes (important for dynamic theming)
      Array.from(content.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          this.container.setAttribute(attr.name, attr.value);
        }
      });
      
      // Update active nav links
      this.updateActiveLinks(path);

      // Manage creator-specific body class
      if (path === 'creator') {
        document.body.classList.add('creator-mode');
      } else {
        document.body.classList.remove('creator-mode');
      }

      // Force scroll reset - absolutely critical for dynamic themes to sync correctly
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);

      // Initialize the dynamic theme engine for the new content
      initDynamicTheming();

      // Secondary scroll safety (handles edge cases in some browsers)
      requestAnimationFrame(() => window.scrollTo(0, 0));

      // Global event
      document.dispatchEvent(new CustomEvent('page-loaded', { detail: { path } }));
      
    } catch (error) {
      console.error('Routing error:', error);
      this.container.innerHTML = `
        <div class="sub-page">
          <section class="elements-hero">
            <div class="title-stack">
              <span class="overline">ERROR // 404</span>
              <h1 class="hero-title cinematic">LOST IN THE NOISE</h1>
              <p class="tagline">System failure or missing frequency.</p>
            </div>
          </section>
        </div>
      `;
    } finally {
      this.container.classList.remove('loading');
    }
  }

  updateActiveLinks(path) {
    document.querySelectorAll('m-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#/${path}` || (path === 'home' && href === '#/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
