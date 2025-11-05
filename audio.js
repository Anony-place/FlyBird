// Flappy Bird Ultimate - Audio Manager
// Handles all sound effects and music playback

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.backgroundMusicRunning = false;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    // Play simple tone sound
    playSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    // Sound effects
    playFlapSound() {
        this.playSound(523, 0.08, 'sine', 0.4);
        this.playSound(659, 0.06, 'sine', 0.3);
    }

    playPointSound() {
        this.playSound(900, 0.05, 'sine', 0.5);
        this.playSound(1100, 0.08, 'sine', 0.4);
        this.playSound(1300, 0.05, 'sine', 0.3);
    }

    playCollisionSound() {
        this.playSound(200, 0.1, 'sine', 0.6);
        this.playSound(150, 0.15, 'sine', 0.5);
        this.playSound(100, 0.2, 'sine', 0.4);
    }

    playPowerUpSound() {
        this.playSound(1100, 0.08, 'sine', 0.5);
        this.playSound(1400, 0.08, 'sine', 0.5);
        this.playSound(1700, 0.1, 'sine', 0.5);
    }
    
    playSpeedBoostSound() {
        this.playSound(800, 0.05, 'sine', 0.5);
        this.playSound(1200, 0.08, 'sine', 0.6);
        this.playSound(1600, 0.1, 'sine', 0.5);
    }

    playButtonClickSound() {
        this.playSound(700, 0.05, 'sine', 0.4);
        this.playSound(900, 0.05, 'sine', 0.3);
    }

    playLevelUpSound() {
        this.playSound(523, 0.1, 'sine', 0.5);
        this.playSound(659, 0.1, 'sine', 0.5);
        this.playSound(784, 0.1, 'sine', 0.5);
        this.playSound(1047, 0.15, 'sine', 0.6);
    }

    playGameOverSound() {
        this.playSound(400, 0.15, 'sine', 0.6);
        this.playSound(320, 0.15, 'sine', 0.6);
        this.playSound(240, 0.2, 'sine', 0.5);
    }

    playCoinCollectSound() {
        this.playSound(1400, 0.05, 'sine', 0.5);
        this.playSound(1700, 0.08, 'sine', 0.5);
    }

    playShieldActivateSound() {
        this.playSound(659, 0.08, 'sine', 0.5);
        this.playSound(784, 0.08, 'sine', 0.5);
        this.playSound(987, 0.1, 'sine', 0.5);
    }

    playComboSound() {
        this.playSound(1100, 0.06, 'sine', 0.4);
        this.playSound(1400, 0.06, 'sine', 0.4);
    }
    
    playMagnetSound() {
        this.playSound(1200, 0.1, 'sine', 0.4);
        this.playSound(1800, 0.1, 'sine', 0.5);
    }
    
    playSlowMotionSound() {
        this.playSound(400, 0.1, 'sine', 0.4);
        this.playSound(200, 0.15, 'sine', 0.5);
    }

    playMenuMusic() {
        if (!this.musicEnabled || !this.audioContext || this.backgroundMusicRunning) return;
        this.backgroundMusicRunning = true;
        this.playMusicSequence();
    }

    stopMenuMusic() {
        this.backgroundMusicRunning = false;
    }

    // More dynamic background music sequence
    playMusicSequence() {
        if (!this.backgroundMusicRunning) return;
        
        // Professional game music melody with more variety
        const notes = [
            { freq: 523, duration: 0.3 },   // C
            { freq: 587, duration: 0.3 },   // D
            { freq: 659, duration: 0.4 },   // E
            { freq: 784, duration: 0.3 },   // G
            { freq: 659, duration: 0.2 },   // E
            { freq: 587, duration: 0.3 },   // D
            { freq: 523, duration: 0.4 },   // C
            { freq: 587, duration: 0.3 },   // D
            { freq: 659, duration: 0.3 },   // E
            { freq: 784, duration: 0.3 },   // G
            { freq: 880, duration: 0.4 },   // A
            { freq: 784, duration: 0.3 },   // G
            { freq: 659, duration: 0.5 }    // E
        ];
        let noteIndex = 0;

        const playNote = () => {
            if (!this.backgroundMusicRunning) return;
            
            if (noteIndex >= notes.length) {
                noteIndex = 0;
            }
            
            const note = notes[noteIndex];
            this.playSound(note.freq, note.duration, 'sine', 0.15);
            
            setTimeout(() => {
                noteIndex++;
                playNote();
            }, note.duration * 1000 + 30);
        };

        playNote();
    }

    // Volume controls
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
    }

    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    toggleSound(enabled) {
        this.soundEnabled = enabled;
    }

    toggleMusic(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopMenuMusic();
        }
    }
}
