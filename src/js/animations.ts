class MagazineReveal extends HTMLElement {
  private observer: IntersectionObserver | null = null;

  connectedCallback(): void {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.classList.add('active');
          if (this.hasAttribute('once')) this.observer?.unobserve(this);
        }
      });
    }, observerOptions);

    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
  }
}

class MagazineNav extends HTMLElement {
  private _handleScroll: (() => void) | null = null;

  connectedCallback(): void {
    this.innerHTML = `
      <a href="index.html" class="logo">SJEF VAN LEEUWEN</a>
      
      <button class="nav-toggle" aria-label="Toggle navigation">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="blog.html">Blog</a>
        <a href="audio-test.html">Audio</a>
        <a href="journal.html">Journal</a>
        <a href="about.html">About</a>
        <a href="cv.html">CV</a>
      </div>
    `;

    const toggle = this.querySelector('.nav-toggle') as HTMLElement;
    const links = this.querySelector('.nav-links') as HTMLElement;

    toggle.addEventListener('click', () => {
      this.classList.toggle('nav-open');
      document.body.classList.toggle('no-scroll');
    });

    // Close menu when a link is clicked (important for SPA)
    links.addEventListener('click', (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'A') {
        this.classList.remove('nav-open');
        document.body.classList.remove('no-scroll');
      }
    });

    const handleScroll = () => {
      // Check multiple scroll sources for maximum compatibility
      const scrollPos = window.pageYOffset || 
                        document.documentElement.scrollTop || 
                        document.body.scrollTop || 0;
      
      if (scrollPos > 20) {
        this.classList.add('scrolled');
      } else {
        this.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run immediately
    requestAnimationFrame(handleScroll);
    
    this._handleScroll = handleScroll;
  }

  disconnectedCallback(): void {
    if (this._handleScroll) {
      window.removeEventListener('scroll', this._handleScroll);
    }
  }
}

class MagazineChevron extends HTMLElement {
  connectedCallback(): void {
    const text = this.getAttribute('text') || 'Scroll';
    this.innerHTML = `
      <div class="chevron-container" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div class="bounce" style="line-height: 1; display: flex; justify-content: center;">
          <svg width="30" height="15" viewBox="0 0 40 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 5l15 10L35 5"/>
          </svg>
        </div>
        <span style="font-family: 'Orbitron'; font-size: 0.55rem; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px; color: rgba(255,255,255,0.6);">${text}</span>
      </div>
    `;
    
    this.addEventListener('click', () => {
      const parentSection = this.closest('section') || this.closest('header');
      const nextSection = parentSection?.nextElementSibling as HTMLElement | null;
      if (nextSection) {
        // Calculate offset to account for fixed navigation height
        const nav = document.querySelector('m-nav') as HTMLElement | null;
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = nextSection.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }
}

class MagazineFooter extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = `
      <footer>
        <div class="footer-grid">
          <div class="footer-col">
            <h4 style="font-family: 'Orbitron'; font-size: 1.5rem; letter-spacing: 5px;">SJEF VAN LEEUWEN</h4>
            <p style="color: #666; line-height: 1.8; margin-top: 20px;">A showcase of modern architecture, strategy, and design using vanilla web technologies.</p>
          </div>
          <div class="footer-col">
            <h4>Sections</h4>
            <ul>
              <li><a href="#/diagrams">Diagrams</a></li>
              <li><a href="#/blog">Blog</a></li>
              <li><a href="#/elements">Elements</a></li>
              <li><a href="#/creator">Card Creator</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#/about">About Us</a></li>
              <li><a href="#/contact">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Stay Connected</h4>
            <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Subscribe to our newsletter for weekly tech and strategy insights.</p>
            <div style="display: flex;">
              <input type="email" placeholder="Email" style="padding: 10px; background: #111; border: 1px solid #222; color: #fff; flex: 1;">
              <button style="background: #fff; border: none; padding: 10px 15px; cursor: pointer;">GO</button>
            </div>
          </div>
        </div>
        <div class="copyright">
          &copy; 2026 SJEF VAN LEEUWEN. ALL RIGHTS RESERVED.
        </div>
      </footer>
    `;
  }
}

customElements.define('m-reveal', MagazineReveal);
customElements.define('m-nav', MagazineNav);
customElements.define('m-chevron', MagazineChevron);
customElements.define('m-footer', MagazineFooter);
