/**
 * Global Audio Service
 * Maintains persistent audio state across SPA navigation
 */
class AudioService {
    public audio: HTMLAudioElement;
    private audioCtx: AudioContext | null = null;
    private analyzer: AnalyserNode | null = null;
    public isInitialized: boolean = false;
    public currentSrc: string | null = null;
    public currentTitle: string | null = null;
    public currentArtist: string | null = null;
    private dataArray: Uint8Array | null = null;
    private _resumeHandler: () => void;

    constructor() {
        this.audio = new Audio();
        
        // Auto-resume AudioContext on user interaction if needed
        this._resumeHandler = () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        };
        window.addEventListener('click', this._resumeHandler, { once: true });
    }

    init(): void {
        if (this.isInitialized) return;
        
        try {
            const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioCtxClass();
            this.analyzer = this.audioCtx!.createAnalyser();
            const source = this.audioCtx!.createMediaElementSource(this.audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioCtx!.destination);
            
            this.analyzer.fftSize = 1024;
            const bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.isInitialized = true;
        } catch (e) {
            console.error('AudioContext initialization failed:', e);
        }
    }

    play(src?: string | null, title?: string | null, artist?: string | null): Promise<void> {
        this.init();
        
        if (src && this.currentSrc !== src) {
            this.audio.src = src;
            this.currentSrc = src;
            this.currentTitle = title || null;
            this.currentArtist = artist || null;
            this.audio.load();
            this.audio.dispatchEvent(new Event('trackchange'));
        }
        
        return this.audio.play();
    }

    pause(): void {
        this.audio.pause();
    }

    toggle(src?: string | null, title?: string | null, artist?: string | null): void {
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

    get isPaused(): boolean {
        return this.audio.paused;
    }

    get currentTime(): number {
        return this.audio.currentTime;
    }

    set currentTime(time: number) {
        this.audio.currentTime = time;
    }

    get duration(): number {
        return this.audio.duration;
    }

    get volume(): number {
        return this.audio.volume;
    }

    set volume(v: number) {
        this.audio.volume = v;
    }

    get analyzerData(): Uint8Array | null {
        if (!this.analyzer || !this.dataArray) return null;
        this.analyzer.getByteFrequencyData(this.dataArray as any);
        return this.dataArray;
    }

    on(event: string, callback: EventListenerOrEventListenerObject): void {
        this.audio.addEventListener(event, callback);
    }

    off(event: string, callback: EventListenerOrEventListenerObject): void {
        this.audio.removeEventListener(event, callback);
    }
}

export const audioService = new AudioService();
