/**
 * Global Audio Service
 * Maintains persistent audio state across SPA navigation
 */
class AudioService {
    constructor() {
        this.audio = new Audio();
        this.audioCtx = null;
        this.analyzer = null;
        this.isInitialized = false;
        this.currentSrc = null;
        this.currentTitle = null;
        this.currentArtist = null;
        this.dataArray = null;

        // Auto-resume AudioContext on user interaction if needed
        this._resumeHandler = () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        };
        window.addEventListener('click', this._resumeHandler, { once: true });
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioCtx.createAnalyser();
            const source = this.audioCtx.createMediaElementSource(this.audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioCtx.destination);
            
            this.analyzer.fftSize = 1024;
            const bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.isInitialized = true;
        } catch (e) {
            console.error('AudioContext initialization failed:', e);
        }
    }

    play(src, title, artist) {
        this.init();
        
        if (src && this.currentSrc !== src) {
            this.audio.src = src;
            this.currentSrc = src;
            this.currentTitle = title;
            this.currentArtist = artist;
            this.audio.load();
            this.audio.dispatchEvent(new Event('trackchange'));
        }
        
        return this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    toggle(src, title, artist) {
        // If no src is provided, or it's the SAME src, we toggle the current audio state
        if (!src || src === this.currentSrc) {
            if (this.audio.paused) {
                this.play(this.currentSrc, this.currentTitle, this.currentArtist);
            } else {
                this.pause();
            }
        } else {
            // If a NEW src is provided, start playing that one
            this.play(src, title, artist);
        }
    }

    get isPaused() {
        return this.audio.paused;
    }

    get currentTime() {
        return this.audio.currentTime;
    }

    set currentTime(time) {
        this.audio.currentTime = time;
    }

    get duration() {
        return this.audio.duration;
    }

    get analyzerData() {
        if (!this.analyzer) return null;
        this.analyzer.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    on(event, callback) {
        this.audio.addEventListener(event, callback);
    }

    off(event, callback) {
        this.audio.removeEventListener(event, callback);
    }
}

export const audioService = new AudioService();
