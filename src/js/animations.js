class MagazineReveal extends HTMLElement {
  connectedCallback() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.classList.add('active');
          if (this.hasAttribute('once')) observer.unobserve(this);
        }
      });
    }, observerOptions);

    observer.observe(this);
  }
}

class MagazineNav extends HTMLElement {
  connectedCallback() {
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

  disconnectedCallback() {
    window.removeEventListener('scroll', this._handleScroll);
  }
}

class MagazineChevron extends HTMLElement {
  connectedCallback() {
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
      const nextSection = parentSection?.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

customElements.define('m-reveal', MagazineReveal);
customElements.define('m-nav', MagazineNav);
customElements.define('m-chevron', MagazineChevron);
