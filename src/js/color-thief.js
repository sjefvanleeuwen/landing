/**
 * ColorThief - Extracts dominant colors from images and generates optimal contrast palettes
 * Uses canvas pixel sampling and color theory for accessible, dynamic theming
 */

class ColorThief {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  getDominantColor(img, quality = 10) {
    const { width, height } = this._prepareCanvas(img);
    const imageData = this.ctx.getImageData(0, 0, width, height).data;
    const colorCounts = {};

    for (let i = 0; i < imageData.length; i += 4 * quality) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 125) continue;
      const brightness = (r + g + b) / 3;
      if (brightness < 10 || brightness > 250) continue;

      const quantized = this._quantizeColor(r, g, b, 24);
      const key = `${quantized.r},${quantized.g},${quantized.b}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    let dominantColor = { r: 10, g: 10, b: 10 };
    let maxScore = -1;

    Object.entries(colorCounts).forEach(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      const { s } = this.rgbToHsl({ r, g, b });
      const score = count * (1 + s * s * 3);
      if (score > maxScore) {
        maxScore = score;
        dominantColor = { r, g, b };
      }
    });

    return dominantColor;
  }

  /**
   * Get a palette of distinct colors from an image
   */
  getPalette(img, colorCount = 4, quality = 10) {
    const { width, height } = this._prepareCanvas(img);
    const imageData = this.ctx.getImageData(0, 0, width, height).data;
    const colorCounts = new Map();

    for (let i = 0; i < imageData.length; i += 4 * quality) {
      const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2], a = imageData[i + 3];
      if (a < 125) continue;
      
      const quantized = this._quantizeColor(r, g, b, 16);
      const key = `${quantized.r},${quantized.g},${quantized.b}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    // Sort by frequency and return top ones
    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b };
      });
  }

  generateTheme(color) {
    const luminance = this.getLuminance(color);
    const saturate = (c, amount) => {
      const hsl = this.rgbToHsl(c);
      hsl.s = Math.min(1, hsl.s + amount);
      return this.hslToRgb(hsl);
    };
    const desaturate = (c, amount) => {
      const hsl = this.rgbToHsl(c);
      hsl.s = Math.max(0, hsl.s - amount);
      return this.hslToRgb(hsl);
    };

    const hsl = this.rgbToHsl(color);
    const bgHsl = { h: hsl.h, s: Math.min(hsl.s, 0.4), l: 0.12 }; 
    let bgDark = this.hslToRgb(bgHsl);
    
    let accent = saturate(color, 0.2);
    accent = this.ensureMinContrast(accent, bgDark, 4.5);
    
    const textOnDark = this.getAccessibleTextColor(bgDark);
    const goldAccent = this.ensureMinContrast({ r: 212, g: 160, b: 23 }, bgDark, 3.0);

    return {
      primaryRgb: this.toRgbString(color),
      bgDarkRgb: this.toRgbString(bgDark),
      textPrimaryRgb: this.toRgbString(textOnDark),
      accentRgb: this.toRgbString(accent),
      goldRgb: this.toRgbString(goldAccent),
      isDark: luminance < 0.5,
      overlayDark: `rgba(${bgDark.r}, ${bgDark.g}, ${bgDark.b}, 0.85)`
    };
  }

  ensureMinContrast(color, bgColor, minRatio = 4.5) {
    let currentRatio = this.getContrastRatio(color, bgColor);
    if (currentRatio >= minRatio) return color;
    const hsl = this.rgbToHsl(color);
    const shouldLighten = this.getLuminance(bgColor) < 0.5;
    let iterations = 0;
    while (currentRatio < minRatio && iterations < 20) {
      hsl.l = shouldLighten ? Math.min(0.95, hsl.l + 0.05) : Math.max(0.05, hsl.l - 0.05);
      const adjusted = this.hslToRgb(hsl);
      currentRatio = this.getContrastRatio(adjusted, bgColor);
      if (currentRatio >= minRatio) return adjusted;
      iterations++;
    }
    return this.hslToRgb(hsl);
  }

  getAccessibleTextColor(bgColor) {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 10, g: 10, b: 10 };
    return this.getContrastRatio(white, bgColor) >= this.getContrastRatio(black, bgColor) ? white : black;
  }

  getLuminance(color) {
    const normalize = (c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * normalize(color.r) + 0.7152 * normalize(color.g) + 0.0722 * normalize(color.b);
  }

  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(color1) + 0.05;
    const l2 = this.getLuminance(color2) + 0.05;
    return Math.max(l1, l2) / Math.min(l1, l2);
  }

  rgbToHsl(color) {
    const r = color.r / 255, g = color.g / 255, b = color.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s, l };
  }

  hslToRgb({ h, s, l }) {
    h /= 360;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
      r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
  }

  toRgbString(color) { return `${color.r}, ${color.g}, ${color.b}`; }

  _prepareCanvas(img) {
    const scale = Math.min(1, 100 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.floor(img.naturalWidth * scale), h = Math.floor(img.naturalHeight * scale);
    this.canvas.width = w; this.canvas.height = h;
    this.ctx.drawImage(img, 0, 0, w, h);
    return { width: w, height: h };
  }

  _quantizeColor(r, g, b, levels) {
    const step = 256 / levels;
    const q = (c) => Math.round(Math.floor(c / step) * step + step / 2);
    return { r: q(r), g: q(g), b: q(b) };
  }
}

class DynamicTheme {
  constructor() {
    this.colorThief = new ColorThief();
    this.colorCache = new Map();
    this._visibilityMap = new Map();
    this.activeElement = null;
    this.defaultTheme = null;
    this.heroImg = null;
    this._lifecycleId = 0;
  }

  reset() {
    this._lifecycleId++;
    if (this.observer) this.observer.disconnect();
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    this.activeElement = null;
    this.defaultTheme = null;
    this.heroImg = null;
    this._visibilityMap.clear();
    const root = document.documentElement;
    ['--theme-bg', '--theme-bg-rgb', '--theme-primary', '--theme-text', '--theme-accent', '--theme-gold', '--theme-overlay']
      .forEach(p => root.style.removeProperty(p));
    root.classList.remove('theme-dark', 'theme-light');
  }

  init() {
    this.reset();
    const currentId = this._lifecycleId;
    const allImages = Array.from(document.querySelectorAll('.article-hero img, .hero-image img, header img, #hero-img, .article-image img, .feature-large img, .full-bleed img, figure img'));
    this.heroImg = allImages.find(img => img.closest('.article-hero, .hero-image, header'));

    this.observer = new IntersectionObserver((entries) => {
      if (this._lifecycleId !== currentId) return;
      entries.forEach(entry => entry.isIntersecting ? this._visibilityMap.set(entry.target, true) : this._visibilityMap.delete(entry.target));
      this._update();
    }, { threshold: [0, 0.1, 1], rootMargin: "20% 0px" });

    allImages.forEach(img => this.observer.observe(img));

    let ticking = false;
    this._onScroll = () => {
      if (this._lifecycleId !== currentId) return;
      if (!ticking) {
        requestAnimationFrame(() => { 
          if (this._lifecycleId === currentId) this._update(); 
          ticking = false; 
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });

    if (this.heroImg) {
      this._extract(this.heroImg).then(theme => {
        if (theme && this._lifecycleId === currentId) {
          this.defaultTheme = theme;
          if (window.scrollY < 100) this._apply(theme, 'hero-initial');
        }
      });
    }
    this._update();
  }

  /**
   * Helper for manual theme application (used in article-3.html)
   */
  async applyFromImage(img) {
    const theme = await this._extract(img);
    if (theme) {
      this._apply(theme, img);
      
      // Also extract a raw palette specifically for visualization
      const rawPalette = this.colorThief.getPalette(img, 4);
      theme.rawPalette = rawPalette.map(c => this.colorThief.toRgbString(c));
      
      return theme;
    }
    return null;
  }

  _update() {
    const currentId = this._lifecycleId;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const focusPoint = vh * 0.15;

    if (scrollY < 50 && this.defaultTheme) {
      this._apply(this.defaultTheme, 'hero-top-reset');
      return;
    }

    let bestImg = null;
    let minDistance = Infinity;

    const images = this._visibilityMap.size > 0 
      ? Array.from(this._visibilityMap.keys())
      : Array.from(document.querySelectorAll('.article-hero img, .hero-image img, .article-image img, figure img'));

    images.forEach(img => {
      if (!img.isConnected || img.offsetWidth === 0) return;
      const rect = img.getBoundingClientRect();
      
      if (rect.top <= focusPoint && rect.bottom >= focusPoint) {
        bestImg = img;
        minDistance = 0;
      } 
      else if (rect.top < vh && rect.bottom > 0) {
        const dist = Math.min(Math.abs(rect.top - focusPoint), Math.abs(rect.bottom - focusPoint));
        if (dist < minDistance) {
          minDistance = dist;
          bestImg = img;
        }
      }
    });

    if (bestImg) {
      this._extract(bestImg).then(theme => {
        if (this._lifecycleId === currentId) {
          this._apply(theme, bestImg);
        }
      });
    } else if (this.defaultTheme) {
      this._apply(this.defaultTheme, 'text-block-fallback');
    }
  }

  async _extract(img) {
    if (this.colorCache.has(img.src)) return this.colorCache.get(img.src);
    if (!img.complete) await new Promise(r => { img.onload = r; img.onerror = r; });
    try {
      const theme = this.colorThief.generateTheme(this.colorThief.getDominantColor(img));
      this.colorCache.set(img.src, theme);
      return theme;
    } catch(e) { return this.defaultTheme; }
  }

  _apply(theme, source) {
    if (!theme || this.activeElement === source) return;
    
    // Safety check for SPA transitions
    if (typeof source !== 'string' && !source.isConnected) return;

    this.activeElement = source;
    requestAnimationFrame(() => {
      // Final guard inside animation frame
      if (typeof source !== 'string' && !source.isConnected) return;
      
      const root = document.documentElement;
      root.style.setProperty('--theme-bg', `rgb(${theme.bgDarkRgb})`);
      root.style.setProperty('--theme-primary', `rgb(${theme.primaryRgb})`);
      root.style.setProperty('--theme-text', `rgb(${theme.textPrimaryRgb})`);
      root.style.setProperty('--theme-accent', `rgb(${theme.accentRgb})`);
      root.style.setProperty('--theme-gold', `rgb(${theme.goldRgb})`);
      root.style.setProperty('--theme-overlay', theme.overlayDark);
      root.classList.toggle('theme-dark', theme.isDark);
      root.classList.toggle('theme-light', !theme.isDark);

      // Handle Palette Display (found in article-3.html)
      // This specifically fulfills the user request for a "different method" (raw palette)
      const paletteContainer = document.getElementById('paletteDisplay');
      if (paletteContainer && (source === this.heroImg || source === 'hero-initial' || source === 'hero-top-reset')) {
        this.colorThief.getPalette(this.heroImg, 4).forEach((color, idx) => {
          const swatches = paletteContainer.querySelectorAll('.palette-swatch');
          if (swatches[idx]) {
            swatches[idx].style.background = `rgb(${this.colorThief.toRgbString(color)})`;
          }
        });
      }
    });
  }
}

window.dynamicTheme = new DynamicTheme();
export function initDynamicTheming() { window.dynamicTheme.init(); }
document.addEventListener('DOMContentLoaded', () => initDynamicTheming());
export { ColorThief, DynamicTheme };
