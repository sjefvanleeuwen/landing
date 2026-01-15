export class MagazineAudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.ctx = null;
        this.analyzer = null;
        this.dataArray = null;
        this.bars = [];
        this.particles = [];
        this.isInitialized = false;
        this.animationId = null;
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
                    <div class="overlay-gradient" style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);"></div>
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
                            <audio id="audio-element" src="${src}"></audio>
                        </div>
                    </m-reveal>
                </div>

                <div class="player-controls-bar" style="position: absolute; bottom: 40px; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 60px; z-index: 100; pointer-events: auto;">
                    <div class="controls-left" style="display: flex; align-items: center; gap: 30px;">
                        <button class="control-btn play-pause-btn" aria-label="Play/Pause" style="background: none; border: none; color: #fff; cursor: pointer; padding: 10px; display: flex; align-items: center; justify-content: center; z-index: 101; pointer-events: auto;">
                            <svg viewBox="0 0 24 24" width="36" height="36" style="display: block; pointer-events: none;"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
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
        const canvas = this.querySelector('#visualizer');
        const audio = this.querySelector('#audio-element');
        const playPauseBtn = this.querySelector('.play-pause-btn');
        const timeDisplayLarge = this.querySelector('.time-display-large');
        const timeProgress = this.querySelector('.time-progress');
        const bgImage = this.querySelector('#player-bg-image');
        
        if (!canvas || !audio) return;

        this.ctx = canvas.getContext('2d');
        const barCount = 180;
        this.bars = new Array(barCount).fill(0);
        this.peaks = new Array(barCount).fill(0);
        
        const initAudio = () => {
            if (this.isInitialized) return;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = audioCtx.createAnalyser();
            const source = audioCtx.createMediaElementSource(audio);
            source.connect(this.analyzer);
            this.analyzer.connect(audioCtx.destination);
            this.analyzer.fftSize = 1024;
            const bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.isInitialized = true;
        };

        const initParticles = () => {
            this.particles = [];
            // Particles are now dynamic and will be spawned from peaks
        };

        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Magazine Gold Palette
            const colorGold = '#C5A028';
            const colorGoldLight = '#F9E49B';
            const colorGoldDark = '#8B6F1B';
            const colorAmber = '#D4813D';

            let bassValue = 0;
            if (this.isInitialized && !audio.paused) {
                this.analyzer.getByteFrequencyData(this.dataArray);
                // Calculate average bass for pulsing effect
                const bassPoints = Math.floor(this.dataArray.length * 0.1);
                let bassSum = 0;
                for (let i = 0; i < bassPoints; i++) bassSum += this.dataArray[i];
                bassValue = bassSum / bassPoints;

                // Subtle background pulsing
                if (bgImage) {
                    const scale = 1 + (bassValue / 255) * 0.05;
                    bgImage.style.transform = `scale(${scale})`;
                    // No brightness dimming during play, background is dark enough
                }
            }

            const spacing = 4;
            const totalWidth = canvas.width;
            const barWidth = 1.5;
            const actualBarCount = Math.min(barCount, Math.floor(totalWidth / (barWidth + spacing))) - 8;
            const startX = (totalWidth - (actualBarCount * (barWidth + spacing))) / 2;
            const centerY = canvas.height * 0.65; // Moved down to ensure text stays above

            this.ctx.strokeStyle = 'rgba(197, 160, 40, 0.2)'; // Gold line
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, centerY);
            this.ctx.lineTo(startX + (actualBarCount * (barWidth + spacing)), centerY);
            this.ctx.stroke();

            for (let i = 0; i < actualBarCount; i++) {
                let targetH = 2; 
                if (this.isInitialized) {
                    // Recalibrated mapping (exponent 1.45) with slightly truncated range (0.75x)
                    // This spreads the musically active frequencies (bass through high-mids) 
                    // across the full visual width, effectively cutting out the "silent" ultra-highs.
                    const index = Math.floor(Math.pow(i / actualBarCount, 1.45) * (this.dataArray.length * 0.75));
                    const value = this.dataArray[index] || 0;
                    
                    // Controlled Gain: Reduce low-end dominance while maintaining the "mountain" shape
                    // Higher power (1.5) for sharper "Small Q" spikes
                    // Amplitude reduced from 0.5 to 0.15 of canvas height for better vertical containment
                    targetH = (Math.pow(value / 255, 1.5)) * (canvas.height * 0.15);
                    
                    if (targetH < 2) targetH = 2;
                    
                    // High-speed physics: drop much faster for that technical look
                    if (targetH > this.bars[i]) {
                        this.bars[i] = targetH * 0.9 + this.bars[i] * 0.1; // Near-instant attack
                    } else {
                        // Aggressive decay: 70% of the movement is towards the floor every frame
                        this.bars[i] = targetH * 0.7 + this.bars[i] * 0.3; 
                    }

                    // Faster Peak Gravity matching the aggressive fall
                    if (this.bars[i] > this.peaks[i]) {
                        this.peaks[i] = this.bars[i];
                    } else {
                        this.peaks[i] -= 3.0; // Very strong gravity for peak dots
                    }
                } else {
                    this.bars[i] = 2 + Math.sin(Date.now() * 0.002 + i * 0.2) * 2;
                    this.peaks[i] = this.bars[i];
                }

                const currentH = this.bars[i];
                const peakH = this.peaks[i];
                const x = startX + i * (barWidth + spacing);
                
                const gradient = this.ctx.createLinearGradient(x, centerY - currentH, x, centerY + currentH);
                gradient.addColorStop(0, 'rgba(212, 129, 61, 0.0)'); // Amber fade
                gradient.addColorStop(0.2, colorAmber);
                gradient.addColorStop(0.5, '#FFFFFF'); // Pure white core for the "nifty" glow
                gradient.addColorStop(0.8, colorAmber);
                gradient.addColorStop(1, 'rgba(212, 129, 61, 0.0)');

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x, centerY - currentH, barWidth, currentH * 2);

                // Enhancement: Add persistent atmospheric glow around the center line
                this.ctx.save();
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = 'rgba(212, 129, 61, 0.4)'; // Warm amber glow
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x, centerY - 1, barWidth, 2);
                this.ctx.restore();

                // Draw Peak Dots with bloom
                if (this.isInitialized && peakH > 5) {
                    this.ctx.save();
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = colorGoldLight;
                    this.ctx.fillStyle = colorGoldLight;
                    this.ctx.fillRect(x, centerY - peakH - 2, barWidth, 1.5);
                    this.ctx.fillRect(x, centerY + peakH + 1, barWidth, 1.5);
                    this.ctx.restore();

                    // Spawn very tiny star-dust particles eminating from the bottom peaks
                    if (this.bars[i] > 30 && Math.random() > 0.98) {
                        this.particles.push({
                            x: x + barWidth / 2,
                            y: centerY + currentH,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: 0.2 + Math.random() * 1.0, 
                            size: Math.random() * 0.7 + 0.2, // Very tiny stardust
                            life: 1.0,
                            color: colorGoldLight
                        });
                    }
                }

                // Add intense golden bloom on high transients
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
                p.vy += 0.015; // Very light gravity for a "floaty" fall
                p.life -= 0.003; // Even slower fade to ensure they reach the bottom
                
                // Allow them to fall off the bottom of the canvas before removal
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

        const formatTime = (s) => {
            if (isNaN(s)) return '00:00';
            const mins = Math.floor(s / 60);
            const secs = Math.floor(s % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const updateTimeDisplay = () => {
            const current = formatTime(audio.currentTime);
            const duration = formatTime(audio.duration);
            timeProgress.textContent = `${current} / ${duration}`;
            timeDisplayLarge.textContent = current.split(':').join(' : ');
        };

        playPauseBtn.addEventListener('click', () => {
            initAudio();
            if (audio.paused) {
                audio.play();
                playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            } else {
                audio.pause();
                playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
            }
        });

        audio.addEventListener('timeupdate', updateTimeDisplay);
        audio.addEventListener('loadedmetadata', updateTimeDisplay);

        draw();
    }

    disconnectedCallback() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
