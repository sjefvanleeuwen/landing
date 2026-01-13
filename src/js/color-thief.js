/**
 * ColorThief - Extracts dominant colors from images and generates optimal contrast palettes
 * Uses canvas pixel sampling and color theory for accessible, dynamic theming
 */

class ColorThief {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Extract the dominant color from an image
   * @param {HTMLImageElement} img - The image element to analyze
   * @param {number} quality - Sampling quality (1 = every pixel, 10 = every 10th pixel)
   * @returns {Object} - RGB color object { r, g, b }
   */
  getDominantColor(img, quality = 10) {
    const { width, height } = this._prepareCanvas(img);
    const imageData = this.ctx.getImageData(0, 0, width, height).data;
    
    const colorCounts = {};

    for (let i = 0; i < imageData.length; i += 4 * quality) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      // Skip transparent/semi-transparent pixels
      if (a < 125) continue;
      
      // Skip very dark or very light pixels (often backgrounds)
      const brightness = (r + g + b) / 3;
      if (brightness < 10 || brightness > 250) continue;

      // Quantize colors to reduce noise (group similar colors)
      const quantized = this._quantizeColor(r, g, b, 24);
      const key = `${quantized.r},${quantized.g},${quantized.b}`;

      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    // Find best color based on frequency AND saturation
    let dominantColor = { r: 10, g: 10, b: 10 }; // Default dark
    let maxScore = -1;

    Object.entries(colorCounts).forEach(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      
      // Calculate saturation for weighting
      const { s } = this.rgbToHsl({ r, g, b });
      
      // Score = Frequency * (1 + Saturation^2)
      // This boosts vibrant colors significantly while still requiring them to be common
      const score = count * (1 + s * s * 3);

      if (score > maxScore) {
        maxScore = score;
        dominantColor = { r, g, b };
      }
    });

    return dominantColor;
  }

  /**
   * Get a palette of colors from an image
   * @param {HTMLImageElement} img - The image element
   * @param {number} colorCount - Number of colors to extract
   * @returns {Array} - Array of RGB color objects
   */
  getPalette(img, colorCount = 5, quality = 10) {
    const { width, height } = this._prepareCanvas(img);
    const imageData = this.ctx.getImageData(0, 0, width, height).data;
    
    const colorCounts = new Map();

    for (let i = 0; i < imageData.length; i += 4 * quality) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 125) continue;
      
      const brightness = (r + g + b) / 3;
      if (brightness < 15 || brightness > 240) continue;

      const quantized = this._quantizeColor(r, g, b, 32);
      const key = `${quantized.r},${quantized.g},${quantized.b}`;

      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    // Sort by frequency and return top colors
    const sorted = [...colorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b };
      });

    return sorted;
  }

  /**
   * Generate a full theme based on dominant color
   * @param {Object} color - RGB color { r, g, b }
   * @returns {Object} - Complete theme with background, text, accent colors
   */
  generateTheme(color) {
    const luminance = this.getLuminance(color);
    const isDark = luminance < 0.5;
    
    // Create variations
    const darken = (c, amount) => ({
      r: Math.max(0, c.r - amount),
      g: Math.max(0, c.g - amount),
      b: Math.max(0, c.b - amount)
    });
    
    const lighten = (c, amount) => ({
      r: Math.min(255, c.r + amount),
      g: Math.min(255, c.g + amount),
      b: Math.min(255, c.b + amount)
    });

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

    // Background - Tinted dark mode (mix color into dark grey)
    // Increased visibility: L=0.15 (was 0.07), S=0.5 (was 0.3)
    const hsl = this.rgbToHsl(color);
    
    // Higher lightness/saturation for more prominent tint
    const bgHsl = { h: hsl.h, s: Math.min(hsl.s, 0.5), l: 0.15 }; 
    let bgDark = this.hslToRgb(bgHsl);

    // If result is too bright for white text, damp it slightly
    // (WCAG guidelines usually want darker, but for "prominent tint" user request we push the limit)
    if (this.getLuminance(bgDark) > 0.2) {
       bgHsl.l = 0.1;
       bgDark = this.hslToRgb(bgHsl);
    }
    
    const bgLight = lighten(color, 180);
    
    // Accent color - ensure it has enough contrast against dark bg
    let accent = saturate(color, 0.2);
    accent = this.ensureMinContrast(accent, bgDark, 4.5);
    
    const accentMuted = desaturate(color, 0.3);
    
    // Text colors with optimal contrast - WCAG AA minimum 4.5:1
    const textOnDark = this.getAccessibleTextColor(bgDark);
    const textOnLight = this.getAccessibleTextColor(bgLight);
    const textOnColor = this.getAccessibleTextColor(color);

    // Generate golden/warm accent - ensure it's visible
    const isWarm = hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
    let goldAccent = isWarm 
      ? { r: 212, g: 175, b: 55 }  // Standard gold
      : this.hslToRgb({ h: 45, s: 0.76, l: 0.52 }); // Warm gold
    
    // Ensure gold has enough contrast
    goldAccent = this.ensureMinContrast(goldAccent, bgDark, 4.5);

    // Calculate and store contrast ratios for debugging/validation
    const contrastRatios = {
      textOnBg: this.getContrastRatio(textOnDark, bgDark),
      accentOnBg: this.getContrastRatio(accent, bgDark),
      goldOnBg: this.getContrastRatio(goldAccent, bgDark),
    };

    return {
      // Primary extracted color
      primary: color,
      primaryRgb: this.toRgbString(color),
      primaryHex: this.toHex(color),
      
      // Backgrounds
      bgDark: bgDark,
      bgDarkRgb: this.toRgbString(bgDark),
      bgLight: bgLight,
      bgLightRgb: this.toRgbString(bgLight),
      
      // Text colors
      textPrimary: textOnDark,
      textPrimaryRgb: this.toRgbString(textOnDark),
      textSecondary: this.adjustAlpha(textOnDark, 0.7),
      textMuted: this.adjustAlpha(textOnDark, 0.5),
      textOnColor: textOnColor,
      
      // Accent colors
      accent: accent,
      accentRgb: this.toRgbString(accent),
      accentHex: this.toHex(accent),
      accentMuted: accentMuted,
      gold: goldAccent,
      goldRgb: this.toRgbString(goldAccent),
      
      // Meta
      isDark: isDark,
      luminance: luminance,
      contrastRatios: contrastRatios,
      
      // Overlay colors
      overlayDark: `rgba(${bgDark.r}, ${bgDark.g}, ${bgDark.b}, 0.85)`,
      overlayLight: `rgba(${bgLight.r}, ${bgLight.g}, ${bgLight.b}, 0.85)`,
    };
  }

  /**
   * Ensure a color meets minimum contrast ratio against a background
   * Adjusts lightness until contrast is sufficient
   * @param {Object} color - The color to adjust
   * @param {Object} bgColor - The background color
   * @param {number} minRatio - Minimum contrast ratio (4.5 for WCAG AA)
   * @returns {Object} - Adjusted color
   */
  ensureMinContrast(color, bgColor, minRatio = 4.5) {
    let currentRatio = this.getContrastRatio(color, bgColor);
    
    if (currentRatio >= minRatio) {
      return color;
    }
    
    const bgLuminance = this.getLuminance(bgColor);
    const hsl = this.rgbToHsl(color);
    
    // Determine direction: lighten for dark bg, darken for light bg
    const shouldLighten = bgLuminance < 0.5;
    
    // Adjust lightness incrementally until we meet the ratio
    let iterations = 0;
    const maxIterations = 50;
    
    while (currentRatio < minRatio && iterations < maxIterations) {
      if (shouldLighten) {
        hsl.l = Math.min(0.95, hsl.l + 0.05);
      } else {
        hsl.l = Math.max(0.05, hsl.l - 0.05);
      }
      
      const adjusted = this.hslToRgb(hsl);
      currentRatio = this.getContrastRatio(adjusted, bgColor);
      
      if (currentRatio >= minRatio) {
        return adjusted;
      }
      
      iterations++;
    }
    
    // If we still can't meet the ratio, boost saturation and try again
    hsl.s = Math.min(1, hsl.s + 0.2);
    hsl.l = shouldLighten ? 0.7 : 0.3;
    
    return this.hslToRgb(hsl);
  }

  /**
   * Get accessible text color that meets WCAG AA (4.5:1 minimum)
   * @param {Object} bgColor - Background color
   * @returns {Object} - Accessible text color
   */
  getAccessibleTextColor(bgColor) {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 10, g: 10, b: 10 };
    
    const whiteRatio = this.getContrastRatio(white, bgColor);
    const blackRatio = this.getContrastRatio(black, bgColor);
    
    // Choose the one with better contrast
    if (whiteRatio >= blackRatio && whiteRatio >= 4.5) {
      return white;
    } else if (blackRatio >= 4.5) {
      return black;
    }
    
    // If neither meets 4.5, return the better one
    return whiteRatio >= blackRatio ? white : black;
  }

  /**
   * Calculate relative luminance (WCAG formula)
   */
  getLuminance(color) {
    const normalize = (c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 
        ? sRGB / 12.92 
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    };
    
    return 0.2126 * normalize(color.r) + 
           0.7152 * normalize(color.g) + 
           0.0722 * normalize(color.b);
  }

  /**
   * Get optimal contrast color (black or white) for a background
   */
  getContrastColor(bgColor) {
    const luminance = this.getLuminance(bgColor);
    // Use white text on dark backgrounds, black on light
    return luminance > 0.179 
      ? { r: 10, g: 10, b: 10 }   // Near black
      : { r: 255, g: 255, b: 255 }; // White
  }

  /**
   * Calculate contrast ratio between two colors (WCAG)
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * RGB to HSL conversion
   */
  rgbToHsl(color) {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s, l };
  }

  /**
   * HSL to RGB conversion
   */
  hslToRgb({ h, s, l }) {
    h = h / 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Convert RGB to hex string
   */
  toHex(color) {
    const toHexPart = (c) => c.toString(16).padStart(2, '0');
    return `#${toHexPart(color.r)}${toHexPart(color.g)}${toHexPart(color.b)}`;
  }

  /**
   * Convert to CSS rgb() string
   */
  toRgbString(color) {
    return `${color.r}, ${color.g}, ${color.b}`;
  }

  /**
   * Create rgba string with alpha
   */
  adjustAlpha(color, alpha) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  // Private helpers
  _prepareCanvas(img) {
    // Scale down for performance
    const maxSize = 100;
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.floor(img.naturalWidth * scale);
    const height = Math.floor(img.naturalHeight * scale);
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0, width, height);
    
    return { width, height };
  }

  _quantizeColor(r, g, b, levels) {
    const step = 256 / levels;
    return {
      r: Math.round(Math.floor(r / step) * step + step / 2),
      g: Math.round(Math.floor(g / step) * step + step / 2),
      b: Math.round(Math.floor(b / step) * step + step / 2)
    };
  }
}

/**
 * DynamicTheme - Applies extracted colors to CSS custom properties
 */
class DynamicTheme {
  constructor() {
    this.colorThief = new ColorThief();
    this.currentTheme = null;
    this.colorCache = new Map();
  }

  /**
   * Apply theme to an element based on an image
   * @param {HTMLImageElement} img - Source image
   * @param {HTMLElement} target - Element to apply theme to (defaults to :root)
   */
  async applyFromImage(img, target = document.documentElement) {
    if (this.colorCache.has(img.src)) {
      const cached = this.colorCache.get(img.src);
      this._setCSSProperties(target, cached);
      target.classList.remove('theme-light', 'theme-dark');
      target.classList.add(cached.isDark ? 'theme-dark' : 'theme-light');
      this.currentTheme = cached;
      return cached;
    }

    if (!img.complete) {
      await new Promise(resolve => img.onload = resolve);
    }

    try {
      const dominantColor = this.colorThief.getDominantColor(img);
      const theme = this.colorThief.generateTheme(dominantColor);
      this.colorCache.set(img.src, theme);
      this.currentTheme = theme;

      this._setCSSProperties(target, theme);
      target.classList.remove('theme-light', 'theme-dark');
      target.classList.add(theme.isDark ? 'theme-dark' : 'theme-light');

      return theme;
    } catch (e) {
      console.warn('DynamicTheme: Could not extract colors from image', img.src);
      return null;
    }
  }

  /**
   * Initialize scroll observation to change theme as different images come into view
   */
  initScrollObservation() {
    // Only run if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;

    const options = {
      root: null,
      rootMargin: '-50% 0% -50% 0%', // Trigger when image cross the horizontal center line
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Apply theme to the whole page container or root
          const target = document.querySelector('.article-page') || document.documentElement;
          this.applyFromImage(img, target);
        }
      });
    }, options);

    // Watch all major article images
    const selectors = '.article-image img, .hero-image img, .full-bleed img, .hero-overlay img';
    document.querySelectorAll(selectors).forEach(img => {
      observer.observe(img);
    });
  }

  /**
   * Apply theme from a color directly
   */
  applyFromColor(color, target = document.documentElement) {
    const theme = this.colorThief.generateTheme(color);
    this.currentTheme = theme;
    this._setCSSProperties(target, theme);
    return theme;
  }

  _setCSSProperties(target, theme) {
    const style = target.style;
    
    // Primary color
    style.setProperty('--theme-primary', `rgb(${theme.primaryRgb})`);
    style.setProperty('--theme-primary-rgb', theme.primaryRgb);
    style.setProperty('--theme-primary-hex', theme.primaryHex);
    
    // Backgrounds
    style.setProperty('--theme-bg', `rgb(${theme.bgDarkRgb})`);
    style.setProperty('--theme-bg-rgb', theme.bgDarkRgb);
    style.setProperty('--theme-bg-light', `rgb(${theme.bgLightRgb})`);
    
    // Text
    style.setProperty('--theme-text', `rgb(${theme.textPrimaryRgb})`);
    style.setProperty('--theme-text-rgb', theme.textPrimaryRgb);
    style.setProperty('--theme-text-secondary', theme.textSecondary);
    style.setProperty('--theme-text-muted', theme.textMuted);
    
    // Accent
    style.setProperty('--theme-accent', `rgb(${theme.accentRgb})`);
    style.setProperty('--theme-accent-rgb', theme.accentRgb);
    style.setProperty('--theme-accent-hex', theme.accentHex);
    
    // Gold
    style.setProperty('--theme-gold', `rgb(${theme.goldRgb})`);
    style.setProperty('--theme-gold-rgb', theme.goldRgb);
    
    // Overlays
    style.setProperty('--theme-overlay', theme.overlayDark);
    style.setProperty('--theme-overlay-light', theme.overlayLight);
  }
}

// Create global instance
window.colorThief = new ColorThief();
window.dynamicTheme = new DynamicTheme();

// Auto-initialize elements with data-color-source attribute
document.addEventListener('DOMContentLoaded', () => {
  const dynamicElements = document.querySelectorAll('[data-dynamic-theme]');
  
  // If we're on a page that supports dynamic theming, init scroll observation
  if (dynamicElements.length > 0 || document.querySelector('.article-page')) {
    window.dynamicTheme.initScrollObservation();
  }

  dynamicElements.forEach(async (element) => {
    const imgSelector = element.dataset.dynamicTheme;
    const img = element.querySelector(imgSelector) || document.querySelector(imgSelector);
    
    if (img) {
      await window.dynamicTheme.applyFromImage(img, element);
    }
  });
});

export { ColorThief, DynamicTheme };
