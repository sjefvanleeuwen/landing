import { initDynamicTheming } from './color-thief';

interface RouteConfig {
  template: string;
}

/**
 * Simple Vanilla SPA Router
 */
export class Router {
  private routes: Record<string, RouteConfig>;
  private container: HTMLElement | null;

  constructor(routes: Record<string, RouteConfig>, containerId: string) {
    this.routes = routes;
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Disable automatic browser scroll restoration for a true SPA feel
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Intercept clicks on links
    document.addEventListener('click', (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      
      // We only care about internal links
      if (!link || !link.href.includes(window.location.origin) || link.hasAttribute('data-no-route')) {
        return;
      }

      const url = new URL(link.href);
      const isHtml = url.pathname.endsWith('.html');
      const isHash = link.getAttribute('href')?.startsWith('#');

      if (isHtml && !url.hash) {
        e.preventDefault();
        
        // Force scroll to top immediately on click
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Get just the filename (e.g., 'about.html' -> 'about')
        const filename = url.pathname.split('/').pop()?.replace('.html', '') || '';
        const route = (filename === 'index' || filename === '') ? 'home' : filename;
        
        // Preserve search parameters (query string) when converting to hash
        const search = url.search;
        window.location.hash = `#/${route === 'home' ? '' : route}${search}`;
      } else if (isHash) {
        // If it's already a hash link, handleRoute will be triggered by hashchange event
        // We just ensure we scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  private async handleRoute(): Promise<void> {
    // 1. Immediately scroll to top when navigation begins
    window.scrollTo(0, 0);

    // Support both Hash and Path-based routing (for the GitHub Pages 404 hack)
    let rawPath = window.location.hash.slice(2);
    
    // If no hash, check if there's a path (clean URL support)
    if (!rawPath && window.location.pathname !== '/') {
        rawPath = window.location.pathname.slice(1);
    }
    
    if (!rawPath || rawPath === '') rawPath = 'home';
    
    // Strip query string for route matching
    const path = rawPath.split('?')[0];

    // DETERMINING THE TEMPLATE (CONVENTION-BASED)
    // 1. Check manual route map (for special mappings)
    // 2. Default to [path].html
    const route = this.routes[path];
    const template = route ? route.template : `${path}.html`;
    
    try {
      if (!this.container) return;
      
      this.container.classList.add('loading');
      const response = await fetch(template);
      
      if (!response.ok) throw new Error(`Template not found: ${template}`);
      
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
          this.container!.removeAttribute(attr.name);
        }
      });

      // Transfer data attributes (important for dynamic theming)
      Array.from(content.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          this.container!.setAttribute(attr.name, attr.value);
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
      if (this.container) {
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
      }
    } finally {
      if (this.container) {
        this.container.classList.remove('loading');
      }
    }
  }

  private updateActiveLinks(path: string): void {
    document.querySelectorAll('m-nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#/${path}` || (path === 'home' && href === '#/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
