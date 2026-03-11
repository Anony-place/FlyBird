/**
 * Aero Dash: Sky High - Audio Manager
 * Professional Web Audio implementation with CrazyGames ad-break support.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.7;
        this.isMuted = false;
        this.enabled = true;
        this.lastSoundTimes = {};

        // Pre-init on first interaction to reduce latency
        const initAudio = () => {
            this.init();
            this.resume();
            window.removeEventListener('mousedown', initAudio);
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };
        window.addEventListener('mousedown', initAudio);
        window.addEventListener('keydown', initAudio);
        window.addEventListener('touchstart', initAudio);
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('AudioContext failed', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    mute() { this.isMuted = true; }
    unmute() { this.isMuted = false; }

    playSound(type) {
        if (!this.enabled || this.isMuted) return;

        // Prevent sound spamming
        const now = Date.now();
        if (this.lastSoundTimes[type] && now - this.lastSoundTimes[type] < 50) return;
        this.lastSoundTimes[type] = now;

        this.init();
        this.resume();
        if (!this.ctx) return;

        switch(type) {
            case 'thrust':
                this.playTone(400, 0.1, 'triangle', 0.3);
                this.playTone(600, 0.05, 'sine', 0.2);
                break;
            case 'score':
                this.playTone(800, 0.1, 'sine', 0.4);
                this.playTone(1200, 0.1, 'sine', 0.3);
                break;
            case 'hit':
                this.playTone(200, 0.2, 'sawtooth', 0.5);
                this.playTone(100, 0.3, 'sine', 0.4);
                break;
        }
    }

    playTone(freq, duration, type, vol) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(vol * this.masterVolume, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}

window.audioManager = new AudioManager();
