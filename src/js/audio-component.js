import { audioService } from './audio-service.js';

export class MagazineAudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.ctx = null;
        this.bars = [];
        this.particles = [];
        this.animationId = null;
        this._handleScroll = null;
        this._updateUI = null;
        this._onPlay = null;
        this._onPause = null;
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Untitled';
        const artist = this.getAttribute('artist') || 'Unknown artist';
        const src = this.getAttribute('src') || '';
        const bg = this.getAttribute('bg') || 'images/image2.png';

        this.innerHTML = `
            <section class="article-hero audio-player-hero" style="height: 100vh; width: 100vw; position: relative; overflow: hidden;">
                <div class="hero-image" style="position: absolute; inset: 0; z-index: 1;">
                    <img src="${bg}" alt="Background" id="player-bg-image" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="overlay-gradient" style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%);"></div>
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

                <div class="player-controls-bar" style="position: absolute; bottom: 40px; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 60px; z-index: 100; pointer-events: auto;">
                    <div class="controls-left" style="display: flex; align-items: center; gap: 30px;">
                        <button class="control-btn play-pause-btn" aria-label="Play/Pause" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center; z-index: 101; pointer-events: auto;">
                            <!-- icon injected by JS -->
                        </button>
                        <button class="control-btn volume-btn" aria-label="Volume" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" width="28" height="28" style="display: block; pointer-events: none;"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        </button>
                        <span class="time-progress" style="font-family: 'Orbitron', sans-serif; font-size: 0.8rem; letter-spacing: 0.2em; opacity: 0.6; color: #fff;">00:00 / 00:00</span>
                    </div>

                    <div class="controls-right" style="display: flex; align-items: center; gap: 30px;">
                        <button class="control-btn settings-btn" aria-label="Settings" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px;">
                            <svg viewBox="0 0 24 24" width="24" height="24" style="display: block; pointer-events: none;"><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.09 10.22c-.12.2-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        </button>
                        <button class="control-btn fullscreen-btn" aria-label="Fullscreen" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px;">
                            <svg viewBox="0 0 24 24" width="24" height="24" style="display: block; pointer-events: none;"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                        </button>
                    </div>
                </div>
            </section>
        `;

        this.initVisualizer();
    }

    initVisualizer() {
        const title = this.getAttribute('title') || 'Untitled';
        const artist = this.getAttribute('artist') || 'Unknown artist';
        const src = this.getAttribute('src') || '';
        
        const canvas = this.querySelector('#visualizer');
        const playPauseBtn = this.querySelector('.play-pause-btn');
        const timeDisplayLarge = this.querySelector('.time-display-large');
        const timeProgress = this.querySelector('.time-progress');
        const bgImage = this.querySelector('#player-bg-image');
        
        if (!canvas) return;

        this.ctx = canvas.getContext('2d');
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

        this._updateUI = () => {
            const duration = audioService.duration;
            const current = audioService.currentTime;
            
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
            
            const colorGold = '#C5A028';
            const colorGoldLight = '#F9E49B';
            const colorAmber = '#D4813D';

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

            this.ctx.strokeStyle = 'rgba(197, 160, 40, 0.2)';
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
                
                const gradient = this.ctx.createLinearGradient(x, centerY - currentH, x, centerY + currentH);
                gradient.addColorStop(0, 'rgba(212, 129, 61, 0.0)');
                gradient.addColorStop(0.2, colorAmber);
                gradient.addColorStop(0.5, '#FFFFFF');
                gradient.addColorStop(0.8, colorAmber);
                gradient.addColorStop(1, 'rgba(212, 129, 61, 0.0)');

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, centerY - currentH, barWidth, currentH * 2);

                this.ctx.save();
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = 'rgba(212, 129, 61, 0.4)';
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x, centerY - 1, barWidth, 2);
                this.ctx.restore();

                if (dataArray && peakH > 5) {
                    this.ctx.save();
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = colorGoldLight;
                    this.ctx.fillStyle = colorGoldLight;
                    this.ctx.fillRect(x, centerY - peakH - 2, barWidth, 1.5);
                    this.ctx.fillRect(x, centerY + peakH + 1, barWidth, 1.5);
                    this.ctx.restore();

                    if (this.bars[i] > 30 && Math.random() > 0.98) {
                        this.particles.push({
                            x: x + barWidth / 2,
                            y: centerY + currentH,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: 0.2 + Math.random() * 1.0, 
                            size: Math.random() * 0.7 + 0.2,
                            life: 1.0,
                            color: colorGoldLight
                        });
                    }
                }

                if (currentH > 40) {
                    this.ctx.save();
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = colorAmber;
                    this.ctx.globalAlpha = Math.min(1, currentH / 60);
                    this.ctx.fillRect(x, centerY - currentH, barWidth, currentH * 2);
                    this.ctx.restore();
                }
            }

            this.particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.015;
                p.life -= 0.003;
                
                if (p.life <= 0 || p.y > canvas.height + 20) {
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
