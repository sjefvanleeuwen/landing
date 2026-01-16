import { audioService } from './audio-service.js';
import { ColorThief } from './color-thief.js';

export class MagazineAudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.ctx = null;
        this.bars = [];
        this.peaks = [];
        this.particles = [];
        this.animationId = null;
        this.vizMode = 'both'; // both, upper, lower
        this._handleScroll = null;
        this._updateUI = null;
        this._onPlay = null;
        this._onPause = null;
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Untitled';
        const artist = this.getAttribute('artist') || 'Unknown artist';
        const src = this.getAttribute('src') || '';
        const bg = this.getAttribute('bg') || 'images/cube3__camera_settings_photorealistic4kcinematiccinestillmuted_5abb89d1-5f44-438f-a008-8fbeda9ab431.png';

        this.innerHTML = `
            <style>
                .volume-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.85);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .volume-slider::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.85);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
                .seek-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 0;
                    height: 0;
                    opacity: 0;
                }
                .seek-slider::-moz-range-thumb {
                    width: 0;
                    height: 0;
                    opacity: 0;
                    border: none;
                }
                .seek-slider {
                    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .seek-slider:hover {
                    height: 8px !important;
                }
            </style>
            <section class="article-hero audio-player-hero" style="height: 100vh; width: 100vw; position: relative; overflow: hidden;">
                <div class="hero-image" style="position: absolute; inset: 0; z-index: 1;">
                    <img src="${bg}" alt="Background" id="player-bg-image" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="overlay-gradient" style="position: absolute; inset: 0;"></div>
                </div>

                <canvas id="visualizer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none;"></canvas>

                <div class="hero-overlay player-content-wrapper" style="position: relative; z-index: 10; width: 80%; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; height: 100%; transform: translateY(-30px);">
                    <m-reveal class="fly-in-up active">
                        <div class="top-info" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
                            <div class="track-info" style="text-align: left;">
                                <h1 class="track-title" style="font-family: 'Michroma', sans-serif; font-size: clamp(1.5rem, 4vw, 2.5rem); text-transform: uppercase; color: #fff; margin: 0; line-height: 1.2;">${title}</h1>
                                <p class="track-artist" style="font-family: 'Orbitron', sans-serif; font-size: clamp(0.7rem, 1.5vw, 1rem); letter-spacing: 0.4em; color: #C5A028; margin: 5px 0 0 0;">${artist}</p>
                            </div>
                            <div class="time-display-large" style="font-family: 'Michroma', sans-serif; font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 400; color: #fff; text-shadow: 0 0 30px rgba(255, 255, 255, 0.4); font-variant-numeric: tabular-nums; width: 6em; text-align: right; line-height: 1.2;">00 : 00</div>
                        </div>

                        <div class="visualizer-placeholder" style="width: 100%; height: 150px; position: relative;">
                            <!-- Audio logic moved to global audio-service.js -->
                        </div>
                    </m-reveal>
                </div>

                <div class="progress-bar-container" style="position: absolute; bottom: 110px; left: 0; width: 100%; padding: 0 60px; z-index: 100;">
                    <input type="range" class="seek-slider" min="0" max="100" value="0" style="width: 100%; height: 4px; appearance: none; background: rgba(255,255,255,0.15); outline: none; border-radius: 2px; cursor: pointer;">
                </div>

                <div class="player-controls-bar" style="position: absolute; bottom: 40px; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 60px; z-index: 100; pointer-events: auto;">
                    <div class="controls-left" style="display: flex; align-items: center; gap: 30px;">
                        <button class="control-btn play-pause-btn" aria-label="Play/Pause" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center; z-index: 101; pointer-events: auto;">
                            <!-- icon injected by JS -->
                        </button>
                        <div class="volume-container" style="display: flex; align-items: center; gap: 10px; position: relative;">
                            <button class="control-btn volume-btn" aria-label="Volume" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 24 24" width="28" height="28" style="display: block; pointer-events: none;"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                            </button>
                            <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="${audioService.volume}" style="width: 80px; height: 4px; appearance: none; background: rgba(255,255,255,0.2); outline: none; border-radius: 2px; cursor: pointer; transition: opacity 0.3s; opacity: 0;">
                        </div>
                        <span class="time-progress" style="font-family: 'Orbitron', sans-serif; font-size: 0.8rem; letter-spacing: 0.2em; opacity: 0.6; color: #fff;">00:00 / 00:00</span>
                    </div>

                    <div class="controls-right" style="display: flex; align-items: center; gap: 30px;">
                        <button class="control-btn settings-btn" aria-label="Visualizer Mode" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <svg viewBox="0 0 24 24" width="24" height="24" style="display: block; pointer-events: none;"><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.09 10.22c-.12.2-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                            <span class="mode-label" style="position: absolute; top: -10px; font-family: 'Orbitron', sans-serif; font-size: 8px; text-transform: uppercase; white-space: nowrap; background: #C5A028; color: #000; padding: 2px 4px; border-radius: 2px; opacity: 0; transition: opacity 0.3s;">Default</span>
                        </button>
                    </div>
                </div>
            </section>
        `;

        // Add Hover Effect for Volume Slider
        const volContainer = this.querySelector('.volume-container');
        const volSlider = this.querySelector('.volume-slider');
        if (volContainer && volSlider) {
            volContainer.addEventListener('mouseenter', () => volSlider.style.opacity = '1');
            volContainer.addEventListener('mouseleave', () => volSlider.style.opacity = '0');
            volSlider.addEventListener('input', (e) => {
                const v = e.target.value;
                audioService.volume = v;
                volSlider.style.background = `linear-gradient(to right, rgba(255,255,255,0.85) ${v * 100}%, rgba(255,255,255,0.2) ${v * 100}%)`;
            });
            // Initial volume background
            volSlider.style.background = `linear-gradient(to right, rgba(255,255,255,0.85) ${audioService.volume * 100}%, rgba(255,255,255,0.2) ${audioService.volume * 100}%)`;
        }

        this.initVisualizer();
    }

    initVisualizer() {
        const title = this.getAttribute('title') || 'Untitled';
        const artist = this.getAttribute('artist') || 'Unknown artist';
        const src = this.getAttribute('src') || '';
        
        const canvas = this.querySelector('#visualizer');
        const playPauseBtn = this.querySelector('.play-pause-btn');
        const seekSlider = this.querySelector('.seek-slider');
        const timeDisplayLarge = this.querySelector('.time-display-large');
        const timeProgress = this.querySelector('.time-progress');
        const bgImage = this.querySelector('#player-bg-image');
        
        if (!canvas) return;

        this.ctx = canvas.getContext('2d');
        const colorThief = new ColorThief();
        let themeColors = {
            primary: '#C5A028',
            secondary: '#D4813D',
            light: '#F9E49B'
        };

        const updateColorsFromImage = () => {
            try {
                // Get a larger palette to ensure we have variety
                const palette = colorThief.getPalette(bgImage, 8);
                if (palette && palette.length >= 3) {
                    const inv = (c) => ({ r: 255 - c.r, g: 255 - c.g, b: 255 - c.b });
                    
                    // Function to ensure a color is "bright" or "visible" by shifting it towards white if too dark
                    const boost = (c, minBrightness = 180) => {
                        const b = (c.r + c.g + c.b) / 3;
                        if (b < minBrightness) {
                            const factor = minBrightness / Math.max(b, 1);
                            return {
                                r: Math.min(255, c.r * factor),
                                g: Math.min(255, c.g * factor),
                                b: Math.min(255, c.b * factor)
                            };
                        }
                        return c;
                    };

                    // Extract distinct roles from the palette and invert them
                    const p0 = boost(inv(palette[0]), 200); // Title should be quite bright
                    const p1 = boost(inv(palette[1]), 160);
                    themeColors.primary = `rgb(${p0.r}, ${p0.g}, ${p0.b})`;
                    themeColors.secondary = `rgb(${p1.r}, ${p1.g}, ${p1.b})`;
                    
                    // Find a "light" color for highlights (inverted becomes dark/contrast)
                    const lightSource = palette.find(c => (c.r + c.g + c.b) > 400) || palette[2];
                    const lBase = boost(inv(lightSource), 230); // Timer should be very bright
                    themeColors.light = `rgb(${lBase.r}, ${lBase.g}, ${lBase.b})`;

                    // Find a "vibrant" color for glow/accents
                    const vibrantSource = palette.slice(1).sort((a, b) => {
                        const sA = Math.max(a.r, a.g, a.b) - Math.min(a.r, a.g, a.b);
                        const sB = Math.max(b.r, b.g, b.b) - Math.min(b.r, b.g, b.b);
                        return sB - sA;
                    })[0];
                    const vBase = inv(vibrantSource);
                    themeColors.accent = `rgb(${vBase.r}, ${vBase.g}, ${vBase.b})`;
                    
                    // Create a 5-color palette specifically for building the gradients (all inverted)
                    const top5 = palette.slice(0, 5).map(inv);
                    themeColors.gradPalette = top5.map(c => `rgb(${c.r}, ${c.g}, ${c.b})`);

                    // Create a full palette for spectral effects
                    themeColors.fullPalette = palette.map(inv).map(c => `rgb(${c.r}, ${c.g}, ${c.b})`);

                    // Apply colors to the UI elements for a sharp, reactive look
                    const titleEl = this.querySelector('.track-title');
                    const largeTimeEl = this.querySelector('.time-display-large');
                    const artistEl = this.querySelector('.track-artist');
                    const progressEl = this.querySelector('.time-progress');
                    const volumeBtnEl = this.querySelector('.volume-btn');
                    const playPauseBtnEl = this.querySelector('.play-pause-btn');
                    
                    const brokenWhite = 'rgba(255, 255, 255, 0.85)';

                    if (titleEl) titleEl.style.color = brokenWhite;
                    if (largeTimeEl) {
                        largeTimeEl.style.color = brokenWhite;
                        largeTimeEl.style.textShadow = `0 0 30px ${themeColors.accent}44`;
                    }
                    if (artistEl) artistEl.style.color = themeColors.primary;
                    if (progressEl) progressEl.style.color = brokenWhite;
                    if (volumeBtnEl) volumeBtnEl.style.color = brokenWhite;
                    if (playPauseBtnEl) playPauseBtnEl.style.color = brokenWhite;
                    if (seekSlider) seekSlider.style.background = `rgba(255, 255, 255, 0.15)`;
                }
            } catch (e) {
                console.warn("ColorThief extraction failed:", e);
            }
        };

        if (bgImage) {
            bgImage.crossOrigin = "anonymous";
            if (bgImage.complete) {
                updateColorsFromImage();
            } else {
                bgImage.addEventListener('load', updateColorsFromImage);
            }
        }

        const barCount = 180;
        this.bars = new Array(barCount).fill(0);
        this.peaks = new Array(barCount).fill(0);
        
        const updatePlayIcons = () => {
            const isPaused = audioService.isPaused;
            const playPath = "M8 5v14l11-7z";
            const pausePath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
            const currentPath = isPaused ? playPath : pausePath;

            playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" width="36" height="36" style="display: block; pointer-events: none;"><path fill="currentColor" d="${currentPath}"/></svg>`;
        };

        const togglePlayback = (e) => {
            e.stopPropagation();
            audioService.toggle(src, title, artist);
            updatePlayIcons();
        };

        playPauseBtn.addEventListener('click', togglePlayback);

        let isDragging = false;
        seekSlider.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        seekSlider.addEventListener('touchstart', () => isDragging = true, { passive: true });
        window.addEventListener('touchend', () => isDragging = false, { passive: true });

        seekSlider.addEventListener('input', (e) => {
            const duration = audioService.duration;
            if (duration) {
                audioService.currentTime = (e.target.value / 100) * duration;
            }
        });

        const settingsBtn = this.querySelector('.settings-btn');
        const modeLabel = this.querySelector('.mode-label');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const modes = ['both', 'upper', 'lower'];
                const currentIndex = modes.indexOf(this.vizMode);
                this.vizMode = modes[(currentIndex + 1) % modes.length];
                
                if (modeLabel) {
                    modeLabel.textContent = this.vizMode.charAt(0).toUpperCase() + this.vizMode.slice(1);
                    modeLabel.style.opacity = '1';
                    setTimeout(() => {
                        modeLabel.style.opacity = '0';
                    }, 1500);
                }
                console.log(`Visualizer Mode: ${this.vizMode}`);
            });
        }

        this._updateUI = () => {
            if (isDragging) return;
            const duration = audioService.duration;
            const current = audioService.currentTime;
            const brokenWhite = 'rgba(255, 255, 255, 0.85)';

            if (duration && !isNaN(duration)) {
                const percent = (current / duration) * 100;
                seekSlider.value = percent;
                seekSlider.style.background = `linear-gradient(to right, ${brokenWhite} ${percent}%, rgba(255, 255, 255, 0.15) ${percent}%)`;
            }
            
            const formatTime = (s) => {
                if (isNaN(s)) return '00:00';
                const mins = Math.floor(s / 60);
                const secs = Math.floor(s % 60);
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };

            const ftLarge = formatTime(current).split(':').join(' : ');
            if (timeDisplayLarge) timeDisplayLarge.textContent = ftLarge;
            if (timeProgress) timeProgress.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
            
            updatePlayIcons();
        };

        this._onPlay = () => updatePlayIcons();
        this._onPause = () => updatePlayIcons();

        audioService.on('timeupdate', this._updateUI);
        audioService.on('play', this._onPlay);
        audioService.on('pause', this._onPause);
        audioService.on('ended', this._onPause);

        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const colorPrimary = themeColors.primary;
            const colorLight = themeColors.light;
            const colorSecondary = themeColors.secondary;
            const colorAccent = themeColors.accent || colorSecondary;
            const palette = themeColors.fullPalette || [colorPrimary, colorSecondary, colorLight];

            let bassValue = 0;
            const dataArray = audioService.analyzerData;

            if (dataArray && !audioService.isPaused) {
                const bassPoints = Math.floor(dataArray.length * 0.1);
                let bassSum = 0;
                for (let i = 0; i < bassPoints; i++) bassSum += dataArray[i];
                bassValue = bassSum / bassPoints;

                if (bgImage) {
                    const scale = 1 + (bassValue / 255) * 0.05;
                    bgImage.style.transform = `scale(${scale})`;
                }
            }

            const spacing = 4;
            const totalWidth = canvas.width;
            const barWidth = 1.5;
            const actualBarCount = Math.min(barCount, Math.floor(totalWidth / (barWidth + spacing))) - 8;
            const startX = (totalWidth - (actualBarCount * (barWidth + spacing))) / 2;
            const centerY = canvas.height * 0.65;

            this.ctx.strokeStyle = colorPrimary.replace('rgb', 'rgba').replace(')', ', 0.2)');
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, centerY);
            this.ctx.lineTo(startX + (actualBarCount * (barWidth + spacing)), centerY);
            this.ctx.stroke();

            for (let i = 0; i < actualBarCount; i++) {
                let targetH = 2; 
                if (dataArray) {
                    const index = Math.floor(Math.pow(i / actualBarCount, 1.45) * (dataArray.length * 0.75));
                    const value = dataArray[index] || 0;
                    targetH = (Math.pow(value / 255, 1.5)) * (canvas.height * 0.15);
                    if (targetH < 2) targetH = 2;
                    
                    if (targetH > this.bars[i]) {
                        this.bars[i] = targetH * 0.9 + this.bars[i] * 0.1;
                    } else {
                        this.bars[i] = targetH * 0.7 + this.bars[i] * 0.3; 
                    }

                    if (this.bars[i] > this.peaks[i]) {
                        this.peaks[i] = this.bars[i];
                    } else {
                        this.peaks[i] -= 3.0;
                    }
                } else {
                    this.bars[i] = 2 + Math.sin(Date.now() * 0.002 + i * 0.2) * 2;
                    this.peaks[i] = this.bars[i];
                }

                const currentH = this.bars[i];
                const peakH = this.peaks[i];
                const x = startX + i * (barWidth + spacing);
                
                // Use the top 5 colors to build a complex vertical gradient
                const grad = themeColors.gradPalette || [colorPrimary, colorSecondary, colorLight, colorSecondary, colorPrimary];
                
                // Mode-based drawing logic
                if (this.vizMode === 'both') {
                    const gradient = this.ctx.createLinearGradient(x, centerY - currentH, x, centerY + currentH);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
                    gradient.addColorStop(0.15, grad[4] || grad[0]);
                    gradient.addColorStop(0.3, grad[2] || grad[0]);
                    gradient.addColorStop(0.5, grad[0]);
                    gradient.addColorStop(0.7, grad[1] || grad[0]);
                    gradient.addColorStop(0.85, grad[3] || grad[0]);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, centerY - currentH, barWidth, currentH * 2);
                    
                    if (dataArray && peakH > 5) {
                        this.ctx.save();
                        this.ctx.shadowBlur = 8;
                        this.ctx.shadowColor = colorAccent;
                        this.ctx.fillStyle = colorLight;
                        this.ctx.fillRect(x, centerY - peakH - 2, barWidth, 1.5);
                        this.ctx.fillRect(x, centerY + peakH + 1, barWidth, 1.5);
                        this.ctx.restore();
                    }
                } else if (this.vizMode === 'upper') {
                    const gradient = this.ctx.createLinearGradient(x, centerY - currentH, x, centerY);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
                    gradient.addColorStop(0.3, grad[2] || grad[0]);
                    gradient.addColorStop(0.5, grad[0]);
                    gradient.addColorStop(1, grad[1] || grad[0]);

                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, centerY - currentH, barWidth, currentH);
                    
                    if (dataArray && peakH > 5) {
                        this.ctx.save();
                        this.ctx.shadowBlur = 8;
                        this.ctx.shadowColor = colorAccent;
                        this.ctx.fillStyle = colorLight;
                        this.ctx.fillRect(x, centerY - peakH - 2, barWidth, 1.5);
                        this.ctx.restore();
                    }
                } else if (this.vizMode === 'lower') {
                    const gradient = this.ctx.createLinearGradient(x, centerY, x, centerY + currentH);
                    gradient.addColorStop(0, grad[1] || grad[0]);
                    gradient.addColorStop(0.5, grad[0]);
                    gradient.addColorStop(0.7, grad[2] || grad[0]);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, centerY, barWidth, currentH);
                    
                    if (dataArray && peakH > 5) {
                        this.ctx.save();
                        this.ctx.shadowBlur = 8;
                        this.ctx.shadowColor = colorAccent;
                        this.ctx.fillStyle = colorLight;
                        this.ctx.fillRect(x, centerY + peakH + 1, barWidth, 1.5);
                        this.ctx.restore();
                    }
                }

                // Shadow around center line
                this.ctx.save();
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = grad[0];
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x, centerY - 1, barWidth, 2);
                this.ctx.restore();

                // Particle Spawning (Mostly for aesthetic)
                if (dataArray && peakH > 5) {
                    if (this.bars[i] > 30 && Math.random() > 0.98) {
                        const particleY = this.vizMode === 'upper' ? centerY - currentH : centerY + currentH;
                        this.particles.push({
                            x: x + barWidth / 2,
                            y: particleY,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: this.vizMode === 'upper' ? -0.2 - Math.random() : 0.2 + Math.random(), 
                            size: Math.random() * 0.7 + 0.2,
                            life: 1.0,
                            color: grad[0]
                        });
                    }
                }

                if (currentH > 40) {
                    this.ctx.save();
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = grad[1] || colorSecondary;
                    this.ctx.globalAlpha = Math.min(1, currentH / 60);
                    const yStart = this.vizMode === 'lower' ? centerY : centerY - currentH;
                    const yHeight = this.vizMode === 'both' ? currentH * 2 : currentH;
                    this.ctx.fillRect(x, yStart, barWidth, yHeight);
                    this.ctx.restore();
                }
            }

            this.particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                
                // Gravity depends on direction
                p.vy += (p.vy > 0) ? 0.015 : -0.005; 
                p.life -= 0.003;
                
                // Remove if out of bounds or dead
                if (p.life <= 0 || p.y > canvas.height + 20 || p.y < -20) {
                    this.particles.splice(index, 1);
                    return;
                }

                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.life * 0.8;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;

            this._updateUI();
            this.animationId = requestAnimationFrame(draw);
        };

        this.animationId = requestAnimationFrame(draw);
        updatePlayIcons();
        this._updateUI();
    }

    disconnectedCallback() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this._handleScroll) {
            window.removeEventListener('scroll', this._handleScroll);
        }
        if (this._updateUI) {
            audioService.off('timeupdate', this._updateUI);
        }
        if (this._onPlay) {
            audioService.off('play', this._onPlay);
        }
        if (this._onPause) {
            audioService.off('pause', this._onPause);
            audioService.off('ended', this._onPause);
        }
    }
}

export class GlobalMiniPlayer extends HTMLElement {
    constructor() {
        super();
        this._updateUI = null;
        this._onTrackChange = null;
    }

    connectedCallback() {
        this.render();
        
        this._updateUI = () => {
            const hasSource = !!audioService.currentSrc;
            const isPlaying = !audioService.isPaused;
            const miniDiv = this.querySelector('.mini-player');
            
            if (!hasSource || !miniDiv) {
                if (miniDiv) miniDiv.classList.remove('visible');
                return;
            }

            // Check if we should be visible
            const localPlayer = document.querySelector('m-audio-player');
            let shouldBeVisible = true;

            if (localPlayer) {
                const hero = localPlayer.querySelector('.audio-player-hero');
                if (hero) {
                    const rect = hero.getBoundingClientRect();
                    // Show mini-player if hero is scrolled past its half-point
                    shouldBeVisible = rect.bottom < window.innerHeight * 0.5;
                }
            }
            
            if (shouldBeVisible) {
                miniDiv.classList.add('visible');
            } else {
                miniDiv.classList.remove('visible');
            }

            const title = this.querySelector('.mini-title');
            const artist = this.querySelector('.mini-artist');
            if (title) title.textContent = audioService.currentTitle || '';
            if (artist) artist.textContent = audioService.currentArtist || '';

            const progress = this.querySelector('.mini-progress-bar');
            if (progress && audioService.duration) {
                progress.style.width = `${(audioService.currentTime / audioService.duration) * 100}%`;
            }

            const playBtn = this.querySelector('.mini-play-btn');
            if (playBtn) {
                const path = isPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z";
                playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="${path}"/></svg>`;
            }
        };

        this._onTrackChange = () => {
            this._updateUI();
        };

        audioService.on('timeupdate', this._updateUI);
        audioService.on('play', this._updateUI);
        audioService.on('pause', this._updateUI);
        audioService.on('trackchange', this._onTrackChange);
        
        // Listen to navigation events to re-check visibility
        window.addEventListener('hashchange', this._updateUI);
        window.addEventListener('scroll', this._updateUI, { passive: true });
        window.addEventListener('page-loaded', () => {
            // Give a tiny delay for DOM to settle
            setTimeout(() => this._updateUI(), 50);
        });
        
        this._updateUI();
    }

    render() {
        this.innerHTML = `
            <div class="mini-player global-mini">
                <div class="mini-track-info">
                    <h4 class="mini-title"></h4>
                    <p class="mini-artist"></p>
                </div>
                <div class="mini-controls">
                    <button class="mini-play-btn" aria-label="Play/Pause">
                        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
                <div class="mini-progress-bar"></div>
            </div>
        `;

        this.querySelector('.mini-play-btn').addEventListener('click', () => {
            audioService.toggle();
            this._updateUI();
        });
    }

    disconnectedCallback() {
        audioService.off('timeupdate', this._updateUI);
        audioService.off('play', this._updateUI);
        audioService.off('pause', this._updateUI);
        audioService.off('trackchange', this._onTrackChange);
        window.removeEventListener('hashchange', this._updateUI);
        window.removeEventListener('scroll', this._updateUI);
    }
}
