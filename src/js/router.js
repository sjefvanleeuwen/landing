import { initDynamicTheming } from './color-thief.js';

/**
 * Simple Vanilla SPA Router
 */
export class Router {
  constructor(routes, containerId) {
    this.routes = routes;
    this.container = document.getElementById(containerId);
    if (!this.container) return;
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
          // Get just the filename (e.g., 'about.html' -> 'about')
          const filename = url.pathname.split('/').pop().replace('.html', '');
          const route = filename === 'index' ? 'home' : filename;
          window.location.hash = `#/${route === 'home' ? '' : route}`;
        }
      }
    });
  }

  async handleRoute() {
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
      
      this.updateActiveLinks(path);

      // Scroll to top on navigation BEFORE initializing theming
      // This is critical so the midpoint calculation starts from top
      window.scrollTo(0, 0);

      // Re-initialize dynamic theme and scroll observation
      // Note: initDynamicTheming now handles internal resets
      initDynamicTheming();
      
      // Trigger any custom scripts or observers
      document.dispatchEvent(new CustomEvent('page-loaded', { detail: { path } }));
      
    } catch (error) {
      console.error('Routing error:', error);
      this.container.innerHTML = '<h1>404</h1><p>Page not found.</p>';
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
