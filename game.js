// ============================================================================
// FLAPPY BIRD ULTIMATE - Main Game Engine
// ============================================================================
// Dependencies: audio.js (AudioManager)

// CrazyGames SDK v2 integration
if (window.CrazyGames && window.CrazyGames.SDK) {
    window.CrazyGames.SDK.game.sdkGameLoadingStart();
}

class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update(dt = 1) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 0.2 * dt; // gravity
        this.life -= dt;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Bird {
    constructor(character = 'classic') {
        this.character = character;
        this.x = 100;
        this.y = 200;
        this.width = 34; // Increased size slightly for better visibility
        this.height = 28;
        this.velocity = 0;
        this.gravity = 0.25;
        this.flapPower = -6;
        this.maxVelocity = 7;
        this.rotation = 0;
        this.wingFlap = 0; // Wing animation frame
        this.blinkTimer = 0;
        this.isBlinking = false;

        this.characterColors = {
            classic: { body: '#FFD700', wing: '#FFA500', belly: '#FFFACD' },
            golden: { body: '#FFD700', wing: '#FFB700', belly: '#FFF8DC' },
            ninja: { body: '#1a1a1a', wing: '#333', belly: '#444' },
            magnet: { body: '#FF69B4', wing: '#FF1493', belly: '#FFB6C1' },
            ghost: { body: '#F8F8F8', wing: '#D3D3D3', belly: '#FFFFFF' },
            eagle: { body: '#8B4513', wing: '#654321', belly: '#DEB887' },
            penguin: { body: '#000000', wing: '#333', belly: '#FFFFFF' },
            hummingbird: { body: '#4CAF50', wing: '#45a049', belly: '#98FB98' },
            phoenix: { body: '#FF4500', wing: '#FF6347', belly: '#FFD700' },
            robot: { body: '#A9A9A9', wing: '#808080', belly: '#D3D3D3' },
            robin: { body: '#E07856', wing: '#4A8B7C', belly: '#F4A460' }
        };
    }

    update(dt = 1) {
        this.velocity = Math.min(this.velocity + this.gravity * dt, this.maxVelocity);
        this.y += this.velocity * dt;
        this.rotation = Math.min(this.rotation + 0.05 * dt, Math.PI / 6);
        this.wingFlap = (this.wingFlap + 0.15 * dt) % (Math.PI * 2); // Faster wing animation

        // Blink logic
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            this.isBlinking = !this.isBlinking;
            this.blinkTimer = this.isBlinking ? 5 + Math.random() * 5 : 100 + Math.random() * 200;
        }
    }

    flap() {
        this.velocity = this.flapPower;
        this.rotation = -Math.PI / 6;
        this.wingFlap = -Math.PI / 4; // Wing flaps upward
    }

    draw(ctx) {
        const colors = this.characterColors[this.character] || this.characterColors.classic;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw body with shadow
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowOffsetY = 2;

        // Draw main body (ellipse)
        const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, this.width / 2);
        gradient.addColorStop(0, colors.belly || '#FFFACD');
        gradient.addColorStop(1, colors.body);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(10, -5, 6, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isBlinking) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(12, -5, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Eye shine for life
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(13, -6.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Eyelid
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(7, -5);
            ctx.lineTo(13, -5);
            ctx.stroke();
        }

        // Draw beak
        ctx.fillStyle = '#FF8C00'; // Orange beak
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 2, -2);
        ctx.lineTo(this.width / 2 + 8, 2);
        ctx.lineTo(this.width / 2 - 2, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw animated wings
        ctx.fillStyle = colors.wing;
        const wingRotation = Math.sin(this.wingFlap) * 0.4; // Wing oscillation
        ctx.save();
        ctx.translate(-8, 0);
        ctx.rotate(wingRotation);

        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 14, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();

        // Wing highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(2, -3, 6, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    isAlive() {
        return this.y > -50 && this.y < 10000;
    }
}

class Pipe {
    constructor(x, gap, gapSize) {
        this.x = x;
        this.gap = gap;
        this.gapSize = gapSize;
        this.width = 65; // Slightly wider pipes
        this.speed = 4;
        this.passed = false;
        this.type = Math.random() < 0.2 ? 'bonus' : 'normal';
    }

    update(dt = 1) {
        this.x -= this.speed * dt;
    }

    draw(ctx, canvasHeight) {
        let pipeColor = this.type === 'bonus' ? '#FFD700' : '#4CAF50';
        let pipeHighlight = this.type === 'bonus' ? '#DAA520' : '#2E7D32';

        if (Math.floor(this.x) % 200 === 0 && this.type !== 'bonus') {
            pipeColor = '#FF6B6B'; // Danger pipe
            pipeHighlight = '#CC5555';
        }

        // Draw pipe body
        const gradTop = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        gradTop.addColorStop(0, pipeHighlight);
        gradTop.addColorStop(0.3, pipeColor);
        gradTop.addColorStop(1, pipeHighlight);

        ctx.fillStyle = gradTop;

        // Top pipe
        ctx.fillRect(this.x, 0, this.width, this.gap);
        // Bottom pipe
        ctx.fillRect(this.x, this.gap + this.gapSize, this.width, canvasHeight - this.gap - this.gapSize);

        // Pipe caps
        ctx.fillStyle = pipeColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Top cap
        ctx.fillRect(this.x - 4, this.gap - 25, this.width + 8, 25);
        ctx.strokeRect(this.x - 4, this.gap - 25, this.width + 8, 25);

        // Bottom cap
        ctx.fillRect(this.x - 4, this.gap + this.gapSize, this.width + 8, 25);
        ctx.strokeRect(this.x - 4, this.gap + this.gapSize, this.width + 8, 25);

        // Glossy highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x + 8, 0, 6, this.gap - 25);
        ctx.fillRect(this.x + 8, this.gap + this.gapSize + 25, 6, canvasHeight - (this.gap + this.gapSize + 25));
    }

    isOffScreen() {
        return this.x + this.width < -20;
    }

    collidesWith(bird) {
        const birdLeft = bird.x - bird.width / 2 + 4;
        const birdRight = bird.x + bird.width / 2 - 4;
        const birdTop = bird.y - bird.height / 2 + 4;
        const birdBottom = bird.y + bird.height / 2 - 4;

        const pipeLeft = this.x;
        const pipeRight = this.x + this.width;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < this.gap || birdBottom > this.gap + this.gapSize) {
                return true;
            }
        }

        return false;
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setCanvasSize();

        this.bird = new Bird('classic');
        this.pipes = [];
        this.particles = [];
        this.powerUps = [];
        this.score = 0;
        this.coins = 0;
        this.highScore = this.loadHighScore();
        this.gameRunning = false;
        this.gamePaused = false;
        this.difficulty = 'normal';
        this.frameCount = 0;
        this.audioManager = new AudioManager();
        this.comboMultiplier = 1;
        this.consecutiveScores = 0;

        // Statistics tracking
        this.sessionStats = {
            gamesPlayed: 0,
            totalScore: 0,
            totalCoins: 0,
            gamesWon: 0,
            bestCombo: 0,
            longestSession: 0,
            pipesAvoided: 0
        };
        this.loadStats();

        // Achievement system
        this.achievements = {
            firstFlight: { name: 'First Flight', desc: 'Play your first game', unlocked: false, icon: '🐦' },
            ninetyNine: { name: 'Perfection', desc: 'Reach 99 points', unlocked: false, icon: '🌟' },
            comboKing: { name: 'Combo King', desc: 'Reach 10 consecutive pipes', unlocked: false, icon: '👑' },
            collector: { name: 'Collector', desc: 'Collect 50 coins', unlocked: false, icon: '💰' },
            legend: { name: 'Legend', desc: 'Reach 500 points', unlocked: false, icon: '✨' },
            speedster: { name: 'Speedster', desc: 'Complete 5 games on hard difficulty', unlocked: false, icon: '⚡' },
            survivor: { name: 'Survivor', desc: 'Use 3 shield power-ups in one game', unlocked: false, icon: '🛡' },
            ghost: { name: 'Ghost Master', desc: 'Use ghost mode 5 times', unlocked: false, icon: '👻' }
        };
        this.loadAchievements();

        // Rank system
        this.ranks = [
            { name: 'Rookie', minScore: 0, maxScore: 49, color: '#888888', icon: '🔰' },
            { name: 'Beginner', minScore: 50, maxScore: 99, color: '#4CAF50', icon: '🌱' },
            { name: 'Amateur', minScore: 100, maxScore: 199, color: '#2196F3', icon: '⭐' },
            { name: 'Pro', minScore: 200, maxScore: 399, color: '#FF9800', icon: '🏆' },
            { name: 'Expert', minScore: 400, maxScore: 699, color: '#F44336', icon: '🔥' },
            { name: 'Master', minScore: 700, maxScore: 999, color: '#9C27B0', icon: '👑' },
            { name: 'Legend', minScore: 1000, maxScore: Infinity, color: '#FFD700', icon: '✨' }
        ];

        // Power-ups
        this.activePowerUps = {};
        this.powerUpTypes = {
            shield: { duration: 300, color: '#FFD700', emoji: '🛡' },
            slowMotion: { duration: 350, color: '#00BFFF', emoji: '⏱' },
            magnet: { duration: 500, color: '#FF69B4', emoji: '🧲' },
            doublePoints: { duration: 750, color: '#FFB700', emoji: '2x' },
            ghost: { duration: 150, color: '#E0E0E0', emoji: '👻' },
            speedBoost: { duration: 400, color: '#FF4500', emoji: '⚡' },
            coin: { duration: 0, color: '#FFD700', emoji: '💰' }
        };

        // Game speed multiplier (0.65 = 35% slower than original)
        this.gameSpeedMultiplier = 0.65;

        // Difficulty settings with easier defaults
        this.difficultySettings = { id: 'easy', name: 'Easy', gapSize: 180, spawnRate: 160 };

        // Visual effects
        this.screenShake = 0;
        this.screenShakeIntensity = 0;
        this.scoreFloaters = [];
        this.pipesMissed = 0;
        this.particlesEnabled = true;
        this.menuInitialized = false;
        this.difficultyProgressionEnabled = false; // Set to true to enable dynamic difficulty

        this.gameState = 'menu'; // menu, playing, paused, gameover

        this.lastTime = 0;
        this.lastDt = 1;

        window.addEventListener('click', () => this.handleInput());
        window.addEventListener('keydown', (e) => this.handleKeyInput(e));
        window.addEventListener('touchstart', () => this.handleInput());

        this.initMenu();

        if (window.CrazyGames && window.CrazyGames.SDK) {
            window.CrazyGames.SDK.game.sdkGameLoadingStop();
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    setCanvasSize() {
        this.canvas.width = 400;
        this.canvas.height = 640;
    }

    handleInput() {
        if (this.gameState === 'playing' && !this.gamePaused) {
            this.bird.flap();
            this.audioManager.playFlapSound();
        }
    }

    handleKeyInput(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.gameState === 'playing' && !this.gamePaused) {
                this.bird.flap();
                this.audioManager.playFlapSound();
            }
        }
        if (e.code === 'Escape' && this.gameState === 'playing') {
            this.togglePause();
        }
    }

    initMenu() {
        // Only initialize once
        if (this.menuInitialized) return;
        this.menuInitialized = true;

        this.populateCharacterSelect();
        this.populateDifficultySelect();
        this.updateLeaderboard();
        this.updateMenuRankDisplay();
        this.audioManager.playMenuMusic();

        document.getElementById('playGameBtn').addEventListener('click', () => {
            this.audioManager.stopMenuMusic();
            this.audioManager.playButtonClickSound();
            this.startGame();
        });
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.showSettings();
        });
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.showLeaderboard();
        });
        const achievementsBtn = document.getElementById('achievementsBtn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                this.audioManager.playButtonClickSound();
                this.showAchievements();
            });
        }
        document.getElementById('aboutBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.showAbout();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.togglePause();
        });
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.startGame();
        });
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.goToMenu();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.startGame();
        });
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.goToMenu();
        });

        // Settings
        document.getElementById('settingsCloseBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.hideSettings();
        });
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.audioManager.setMasterVolume(e.target.value / 100);
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.audioManager.setMusicVolume(e.target.value / 100);
            document.getElementById('musicVolumeValue').textContent = e.target.value + '%';
        });
        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.audioManager.setSfxVolume(e.target.value / 100);
            document.getElementById('sfxVolumeValue').textContent = e.target.value + '%';
        });

        document.getElementById('sfxToggle').addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('enabled');
            this.audioManager.toggleSound(e.currentTarget.classList.contains('enabled'));
        });

        document.getElementById('musicToggle').addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('enabled');
            this.audioManager.toggleMusic(e.currentTarget.classList.contains('enabled'));
        });

        document.getElementById('particlesToggle').addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('enabled');
            this.particlesEnabled = e.currentTarget.classList.contains('enabled');
        });

        document.getElementById('leaderboardCloseBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.hideLeaderboard();
        });
        document.getElementById('achievementsCloseBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.hideAchievements();
        });
        document.getElementById('aboutCloseBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.hideAbout();
        });

        // Close modals when clicking on overlay background
        document.getElementById('settingsOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'settingsOverlay') {
                this.hideSettings();
            }
        });
        document.getElementById('leaderboardOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'leaderboardOverlay') {
                this.hideLeaderboard();
            }
        });
        document.getElementById('achievementsOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'achievementsOverlay') {
                this.hideAchievements();
            }
        });
        document.getElementById('aboutOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'aboutOverlay') {
                this.hideAbout();
            }
        });
        document.getElementById('pauseMenuOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'pauseMenuOverlay') {
                this.togglePause();
            }
        });
    }

    populateCharacterSelect() {
        const characters = [
            { id: 'classic', name: '🐦 Classic' },
            { id: 'golden', name: '✨ Golden' },
            { id: 'ninja', name: '🥷 Ninja' },
            { id: 'magnet', name: '🧲 Magnet' },
            { id: 'ghost', name: '👻 Ghost' },
            { id: 'eagle', name: '🦅 Eagle' },
            { id: 'penguin', name: '🐧 Penguin' },
            { id: 'hummingbird', name: '🐦‍🔴 Hummingbird' },
            { id: 'phoenix', name: '🔥 Phoenix' },
            { id: 'robot', name: '🤖 Robot' },
            { id: 'robin', name: '🌸 Robin' }
        ];

        const container = document.getElementById('characterSelect');
        container.innerHTML = '';

        characters.forEach(char => {
            const btn = document.createElement('div');
            btn.className = 'character-option';
            if (char.id === 'classic') btn.classList.add('selected');
            btn.textContent = char.name;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.character-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.bird.character = char.id;
            });
            container.appendChild(btn);
        });
    }

    populateDifficultySelect() {
        const difficulties = [
            { id: 'veryeasy', name: 'Very Easy', gapSize: 200, spawnRate: 180 },
            { id: 'easy', name: 'Easy', gapSize: 180, spawnRate: 160 },
            { id: 'normal', name: 'Normal', gapSize: 150, spawnRate: 140 },
            { id: 'hard', name: 'Hard', gapSize: 120, spawnRate: 120 },
            { id: 'extreme', name: 'Extreme', gapSize: 100, spawnRate: 100 }
        ];

        const container = document.getElementById('difficultySelect');
        container.innerHTML = '';

        difficulties.forEach(diff => {
            const btn = document.createElement('button');
            btn.className = 'difficulty-btn';
            if (diff.id === 'easy') btn.classList.add('active');
            btn.textContent = diff.name;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = diff.id;
                this.difficultySettings = diff;
            });
            container.appendChild(btn);
        });

        this.difficultySettings = difficulties[1]; // Default to easy
    }

    loadStats() {
        const saved = localStorage.getItem('flybird_stats');
        if (saved) {
            this.sessionStats = JSON.parse(saved);
        }
    }

    saveStats() {
        localStorage.setItem('flybird_stats', JSON.stringify(this.sessionStats));
    }

    loadAchievements() {
        const saved = localStorage.getItem('flybird_achievements');
        if (saved) {
            this.achievements = { ...this.achievements, ...JSON.parse(saved) };
        }
    }

    saveAchievements() {
        localStorage.setItem('flybird_achievements', JSON.stringify(this.achievements));
    }

    checkAchievements() {
        // First Flight
        if (this.sessionStats.gamesPlayed === 1 && !this.achievements.firstFlight.unlocked) {
            this.achievements.firstFlight.unlocked = true;
            this.showAchievementUnlocked('firstFlight');
        }

        // Perfection (99 points)
        if (this.score >= 99 && !this.achievements.ninetyNine.unlocked) {
            this.achievements.ninetyNine.unlocked = true;
            this.showAchievementUnlocked('ninetyNine');
        }

        // Combo King (10 consecutive pipes)
        if (this.consecutiveScores >= 10 && !this.achievements.comboKing.unlocked) {
            this.achievements.comboKing.unlocked = true;
            this.showAchievementUnlocked('comboKing');
        }

        // Collector (50 coins)
        if (this.coins >= 50 && !this.achievements.collector.unlocked) {
            this.achievements.collector.unlocked = true;
            this.showAchievementUnlocked('collector');
        }

        // Legend (500 points)
        if (this.score >= 500 && !this.achievements.legend.unlocked) {
            this.achievements.legend.unlocked = true;
            this.showAchievementUnlocked('legend');
        }

        // Speedster (5 hard games)
        if (this.difficulty === 'hard' || this.difficulty === 'extreme') {
            const hardGames = localStorage.getItem('flybird_hard_games') || '0';
            const count = parseInt(hardGames) + 1;
            localStorage.setItem('flybird_hard_games', count.toString());
            if (count >= 5 && !this.achievements.speedster.unlocked) {
                this.achievements.speedster.unlocked = true;
                this.showAchievementUnlocked('speedster');
            }
        }

        this.saveAchievements();
    }

    showAchievementUnlocked(achievementKey) {
        const achievement = this.achievements[achievementKey];
        if (!achievement) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 9999;
            animation: slideInRight 0.5s ease-out, slideOutRight 0.5s ease-out 3.5s forwards;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <div style="font-size: 14px;">🏆 ACHIEVEMENT UNLOCKED!</div>
            <div style="font-size: 16px; margin-top: 5px;">${achievement.icon} ${achievement.name}</div>
            <div style="font-size: 12px; color: rgba(0,0,0,0.7); margin-top: 3px;">${achievement.desc}</div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 4000);
    }

    updateDifficulty() {
        if (!this.difficultyProgressionEnabled) return;

        // Increase difficulty based on score
        if (this.score >= 200 && this.difficultySettings.gapSize > 100) {
            this.difficultySettings.gapSize = Math.max(100, 180 - (this.score / 50));
        }
        if (this.score >= 100 && this.difficultySettings.spawnRate > 100) {
            this.difficultySettings.spawnRate = Math.max(100, 160 - (this.score / 100));
        }
    }

    startGame() {
        this.bird = new Bird(this.bird.character);
        this.pipes = [];
        this.particles = [];
        this.powerUps = [];
        this.scoreFloaters = [];
        this.score = 0;
        this.coins = 0;
        this.activePowerUps = {};
        this.frameCount = 0;
        this.pipesMissed = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameState = 'playing';
        this.comboMultiplier = 1;
        this.consecutiveScores = 0;
        this.sessionStats.gamesPlayed++;
        this.screenShake = 0;

        if (window.CrazyGames && window.CrazyGames.SDK) {
            window.CrazyGames.SDK.game.gameplayStart();
        }

        // Hide all overlays
        const overlays = [
            'mainMenu',
            'gameOverScreen',
            'pauseMenuOverlay',
            'leaderboardOverlay',
            'settingsOverlay',
            'achievementsOverlay',
            'aboutOverlay'
        ];

        overlays.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'mainMenu' || id === 'gameOverScreen') {
                    el.style.display = 'none';
                } else {
                    el.classList.remove('active');
                }
            }
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gamePaused = true;
            this.gameState = 'paused';
            document.getElementById('pauseMenuOverlay').classList.add('active');
            if (window.CrazyGames && window.CrazyGames.SDK) {
                window.CrazyGames.SDK.game.gameplayStop();
            }
        } else if (this.gameState === 'paused') {
            this.gamePaused = false;
            this.gameState = 'playing';
            document.getElementById('pauseMenuOverlay').classList.remove('active');
            if (window.CrazyGames && window.CrazyGames.SDK) {
                window.CrazyGames.SDK.game.gameplayStart();
            }
        }
    }

    goToMenu() {
        this.gameState = 'menu';
        this.gameRunning = false;
        this.gamePaused = false;
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseMenuOverlay').classList.remove('active');
        this.audioManager.playMenuMusic();
        this.updateLeaderboard();
        this.updateMenuRankDisplay();
        if (window.CrazyGames && window.CrazyGames.SDK) {
            window.CrazyGames.SDK.game.gameplayStop();
        }
    }

    // Rewarded ads removed


    updateMenuRankDisplay() {
        const highScoreRank = this.getHighScoreRank();
        document.getElementById('menuRankIcon').textContent = highScoreRank.icon;
        document.getElementById('menuRankText').textContent = highScoreRank.name;
        document.getElementById('menuRankText').style.color = highScoreRank.color;
    }

    showSettings() {
        document.getElementById('settingsOverlay').classList.add('active');
        if (window.CrazyGames && window.CrazyGames.SDK && this.gameState === 'playing') {
            window.CrazyGames.SDK.game.gameplayStop();
        }
    }

    hideSettings() {
        document.getElementById('settingsOverlay').classList.remove('active');
        if (window.CrazyGames && window.CrazyGames.SDK && this.gameState === 'playing') {
            window.CrazyGames.SDK.game.gameplayStart();
        }
    }

    showLeaderboard() {
        this.updateLeaderboard();
        document.getElementById('leaderboardOverlay').classList.add('active');
    }

    hideLeaderboard() {
        document.getElementById('leaderboardOverlay').classList.remove('active');
    }

    showAbout() {
        document.getElementById('aboutOverlay').classList.add('active');
    }

    hideAbout() {
        document.getElementById('aboutOverlay').classList.remove('active');
    }

    showAchievements() {
        this.updateAchievementsDisplay();
        document.getElementById('achievementsOverlay').classList.add('active');
    }

    hideAchievements() {
        document.getElementById('achievementsOverlay').classList.remove('active');
    }

    updateAchievementsDisplay() {
        const container = document.getElementById('achievementsEntries');
        container.innerHTML = '';

        const achievementKeys = Object.keys(this.achievements);
        if (achievementKeys.length === 0) {
            const noAchievements = document.createElement('div');
            noAchievements.style.cssText = 'text-align: center; padding: 20px; color: #aaa;';
            noAchievements.textContent = 'No achievements yet. Keep playing!';
            container.appendChild(noAchievements);
            return;
        }

        achievementKeys.forEach((key) => {
            const achievement = this.achievements[key];
            const entry = document.createElement('div');
            entry.className = 'achievement-entry';
            entry.style.cssText = `
                padding: 12px;
                margin: 8px 0;
                background: ${achievement.unlocked ? 'rgba(255, 215, 0, 0.15)' : 'rgba(100, 100, 100, 0.15)'};
                border: 2px solid ${achievement.unlocked ? '#FFD700' : '#666'};
                border-radius: 8px;
                opacity: ${achievement.unlocked ? '1' : '0.6'};
            `;
            entry.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 28px;">${achievement.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px; color: #fff;">${achievement.name}</div>
                        <div style="font-size: 12px; color: #aaa;">${achievement.desc}</div>
                    </div>
                    <div style="font-size: 20px;">${achievement.unlocked ? '✓' : '🔒'}</div>
                </div>
            `;
            container.appendChild(entry);
        });
    }

    updateLeaderboard() {
        const scores = this.getTopScores();
        const container = document.getElementById('leaderboardEntries');
        container.innerHTML = '';

        if (scores.length === 0) {
            const noScores = document.createElement('div');
            noScores.style.textAlign = 'center';
            noScores.style.padding = '20px';
            noScores.style.color = '#aaa';
            noScores.textContent = 'No scores yet. Play to get on the leaderboard!';
            container.appendChild(noScores);
            return;
        }

        scores.forEach((scoreData, index) => {
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';

            let medals = ['🥇', '🥈', '🥉'];
            let medal = index < 3 ? medals[index] : `#${index + 1}`;

            const difficultyEmoji = { 'veryeasy': '😌', 'easy': '🎮', 'normal': '⚡', 'hard': '🔥', 'extreme': '💀' };
            const diffIcon = difficultyEmoji[scoreData.difficulty] || '🎮';

            entry.innerHTML = `
                <span class="leaderboard-rank">${medal}</span>
                <span style="flex: 1; text-align: left; padding-left: 10px;"><strong>Player ${index + 1}</strong><br/><span style="font-size: 11px; color: #aaa;">${diffIcon} ${scoreData.difficulty || 'normal'}</span></span>
                <span class="leaderboard-score">${scoreData.score}</span>
            `;
            container.appendChild(entry);
        });
    }

    update(dt = 1) {
        if (!this.gameRunning || this.gamePaused) return;

        this.frameCount += dt;

        // Cap particles count to prevent memory leak
        if (this.particles.length > 500) {
            this.particles.splice(0, 100);
        }

        // Cap power-ups count
        if (this.powerUps && this.powerUps.length > 100) {
            this.powerUps.splice(0, 10);
        }

        // Cap score floaters
        if (this.scoreFloaters.length > 100) {
            this.scoreFloaters.splice(0, 10);
        }

        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt);
        }

        // Update bird with trail effect
        this.bird.update(dt);

        // Add bird trail particles
        if (this.particlesEnabled && Math.floor(this.frameCount) % 3 === 0 && Math.floor(this.frameCount) !== Math.floor(this.frameCount - dt)) {
            const colorData = this.bird.characterColors[this.bird.character];
            const trailColor = colorData?.body || '#FFD700';
            this.particles.push(new Particle(
                this.bird.x - 10,
                this.bird.y,
                -1,
                0,
                trailColor,
                15
            ));
        }

        // Update difficulty progression
        this.updateDifficulty();

        // Update score floaters
        for (let i = this.scoreFloaters.length - 1; i >= 0; i--) {
            this.scoreFloaters[i].y -= 2 * dt;
            this.scoreFloaters[i].alpha -= 0.02 * dt;
            if (this.scoreFloaters[i].alpha <= 0) {
                this.scoreFloaters.splice(i, 1);
            }
        }

        // Check bounds
        if (this.bird.y > this.canvas.height || this.bird.y < 0) {
            this.endGame();
            return;
        }

        // Generate pipes - dynamic spawn rate based on difficulty
        const spawnRate = this.difficultySettings.spawnRate || 160;
        if (Math.floor(this.frameCount) % spawnRate === 0 && Math.floor(this.frameCount) !== Math.floor(this.frameCount - dt)) {
            this.generatePipe();
        }

        // Update pipes
        let speedMultiplier = this.gameSpeedMultiplier;
        if (this.activePowerUps.slowMotion) {
            speedMultiplier = this.gameSpeedMultiplier * 0.5;
        } else if (this.activePowerUps.speedBoost) {
            speedMultiplier = this.gameSpeedMultiplier * 1.3;
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].speed = 3 * speedMultiplier;
            this.pipes[i].update(dt);

            // Check collision
            if (this.pipes[i].collidesWith(this.bird)) {
                if (!this.activePowerUps.shield && !this.activePowerUps.ghost) {
                    this.audioManager.playCollisionSound();
                    this.createExplosionParticles(this.bird.x, this.bird.y);
                    this.screenShake = 10;
                    this.screenShakeIntensity = 5;
                    this.consecutiveScores = 0;
                    this.comboMultiplier = 1;
                    this.endGame();
                    return;
                } else if (this.activePowerUps.shield) {
                    this.audioManager.playShieldActivateSound();
                    delete this.activePowerUps.shield;
                    this.createExplosionParticles(this.bird.x, this.bird.y);
                    this.screenShake = 5;
                    this.pipes[i].passed = true; // Mark as passed to avoid re-collision
                } else if (this.activePowerUps.ghost) {
                    this.activePowerUps.ghost.uses--;
                    if (this.activePowerUps.ghost.uses <= 0) {
                        delete this.activePowerUps.ghost;
                    }
                    this.pipes[i].passed = true; // Mark as passed to avoid re-collision
                }
            }

            // Check score - pipes passed completely
            if (!this.pipes[i].passed && this.pipes[i].x + this.pipes[i].width < this.bird.x) {
                this.pipes[i].passed = true;
                this.pipesMissed++;
                this.consecutiveScores++;
                this.comboMultiplier = Math.min(1 + (this.consecutiveScores * 0.1), 3);
                const points = this.activePowerUps.doublePoints ? 2 : 1;
                const finalScore = Math.floor(points * this.comboMultiplier);
                this.score += finalScore;
                this.sessionStats.pipesAvoided++;
                this.audioManager.playPointSound();
                this.createScoreParticles(this.bird.x, this.bird.y);
                this.createScoreFloater(this.bird.x, this.bird.y, `+${finalScore}`);

                // Bonus for high combos
                if (this.consecutiveScores % 5 === 0 && this.consecutiveScores > 0) {
                    this.audioManager.playLevelUpSound();
                    this.audioManager.playComboSound();
                    this.createComboBonusParticles();
                    this.createScoreFloater(this.canvas.width / 2, this.canvas.height / 2, `COMBO x${this.consecutiveScores}!`);
                    if (window.CrazyGames && window.CrazyGames.SDK && this.consecutiveScores >= 10) {
                        window.CrazyGames.SDK.game.happytime();
                    }
                }

                // Track best combo
                if (this.consecutiveScores > this.sessionStats.bestCombo) {
                    this.sessionStats.bestCombo = this.consecutiveScores;
                }
            }

            // Remove off-screen pipes
            if (this.pipes[i].isOffScreen()) {
                this.pipes.splice(i, 1);
            }
        }

        // Update power-ups
        for (let key in this.activePowerUps) {
            this.activePowerUps[key].duration -= dt;
            if (this.activePowerUps[key].duration <= 0) {
                delete this.activePowerUps[key];
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Randomly spawn power-ups with increased frequency
        if (Math.random() < 0.015 * dt) {
            this.spawnPowerUp();
        }
    }

    createScoreFloater(x, y, text) {
        this.scoreFloaters.push({
            x: x,
            y: y,
            text: text,
            alpha: 1,
            vx: (Math.random() - 0.5) * 2
        });
    }

    generatePipe() {
        const gapSize = this.difficultySettings ? this.difficultySettings.gapSize : 180;
        // More intelligent gap positioning for better balance
        const minGap = 75;
        const maxGap = this.canvas.height - gapSize - 75;
        const gap = Math.random() * (maxGap - minGap) + minGap;
        this.pipes.push(new Pipe(this.canvas.width, gap, gapSize));
    }

    spawnPowerUp() {
        const types = Object.keys(this.powerUpTypes).filter(t => t !== 'coin');
        // 40% chance for coin, 60% for other power-ups
        const randomType = Math.random() < 0.4 ? 'coin' : types[Math.floor(Math.random() * types.length)];
        const powerUp = {
            type: randomType,
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 80) + 40,
            width: 30,
            height: 30,
            speed: 3,
            rotation: 0
        };

        if (!this.powerUps) this.powerUps = [];
        this.powerUps.push(powerUp);
    }

    createScoreParticles(x, y) {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 3;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#FFD700',
                30
            ));
        }
    }

    createComboBonusParticles() {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push(new Particle(
                this.canvas.width / 2, this.canvas.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                i % 2 === 0 ? '#FFD700' : '#FFA500',
                50
            ));
        }
    }

    createExplosionParticles(x, y) {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#FF' + Math.floor(Math.random() * 256).toString(16).padStart(2, '0') + '00',
                50
            ));
        }
    }

    draw() {
        // Apply screen shake
        let hasShake = false;
        if (this.screenShake > 0) {
            const offsetX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.screenShakeIntensity;
            this.ctx.translate(offsetX, offsetY);
            hasShake = true;
        }

        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background mountains and huts
        this.drawMountains();
        this.drawHuts();

        // Draw background clouds
        this.drawClouds();

        if (this.gameState === 'menu') {
            // Restore translation if shake was applied
            if (hasShake) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            return;
        }

        // Draw pipes
        for (const pipe of this.pipes) {
            pipe.draw(this.ctx, this.canvas.height);
        }

        // Draw power-ups
        if (this.powerUps && this.powerUps.length > 0) {
            const dt = this.lastDt || 1;
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const pu = this.powerUps[i];
                pu.x -= pu.speed * dt;
                pu.rotation = (pu.rotation + 0.05 * dt) % (Math.PI * 2);

                // Magnet attraction logic
                if (this.activePowerUps.magnet && pu.type === 'coin') {
                    const dx = this.bird.x - pu.x;
                    const dy = this.bird.y - pu.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        const attractForce = 2 * dt;
                        pu.x += (dx / distance) * attractForce;
                        pu.y += (dy / distance) * attractForce;
                    }
                }

                // Check collision with bird
                if (Math.abs(pu.x - this.bird.x) < 30 && Math.abs(pu.y - this.bird.y) < 30) {
                    this.activatePowerUp(pu.type);
                    if (pu.type === 'coin') {
                        this.coins += 10;
                        this.sessionStats.totalCoins += 10;
                        this.audioManager.playCoinCollectSound();
                    } else {
                        this.audioManager.playPowerUpSound();
                    }
                    this.createPowerUpParticles(pu.x, pu.y);
                    this.createScoreFloater(pu.x, pu.y, pu.type === 'coin' ? '+10 🪙' : `+${pu.type}`);
                    this.powerUps.splice(i, 1);
                    continue;
                }

                // Draw power-up with rotation
                const color = this.powerUpTypes[pu.type].color;
                this.ctx.save();
                this.ctx.translate(pu.x, pu.y);
                this.ctx.rotate(pu.rotation);

                // Glow effect
                this.ctx.fillStyle = color + '40';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pu.width / 2 + 8, 0, Math.PI * 2);
                this.ctx.fill();

                // Main circle
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pu.width / 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw border
                this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pu.width / 2, 0, Math.PI * 2);
                this.ctx.stroke();

                // Draw emoji/text inside
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                const symbols = { shield: '🛡', slowMotion: '⏱', magnet: '🧲', doublePoints: '2x', ghost: '👻', speedBoost: '⚡', coin: '💰' };
                if (symbols[pu.type]) {
                    this.ctx.fillText(symbols[pu.type], 0, 0);
                }

                this.ctx.restore();

                // Remove if off-screen
                if (pu.x + pu.width < -10) {
                    this.powerUps.splice(i, 1);
                }
            }
        }

        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }

        // Draw score floaters
        for (const floater of this.scoreFloaters) {
            this.ctx.globalAlpha = floater.alpha;
            this.ctx.fillStyle = floater.text.includes('COMBO') ? '#FFD700' : '#FFA500';
            this.ctx.font = floater.text.includes('COMBO') ? 'bold 20px Arial' : 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(floater.text, floater.x + floater.vx * 5, floater.y);
            this.ctx.globalAlpha = 1;
        }

        // Draw bird
        this.bird.draw(this.ctx);

        // Restore transform if screen shake was applied
        if (hasShake) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Update UI elements
        this.updateUIDisplay();
    }

    updateUIDisplay() {
        // Only update if elements exist
        try {
            const scoreValue = document.getElementById('scoreValue');
            const highScore = document.getElementById('highScoreValue');
            const comboValue = document.getElementById('comboValue');
            const coinsValue = document.getElementById('coinsValue');
            const difficultyInd = document.getElementById('difficultyIndicator');
            const display = document.getElementById('powerUpsDisplay');

            if (!scoreValue || !highScore || !comboValue || !coinsValue || !difficultyInd || !display) {
                return;
            }

            // Update only if values have changed
            if (scoreValue.textContent !== this.score.toString()) {
                scoreValue.textContent = this.score;
            }
            if (highScore.textContent !== this.highScore.toString()) {
                highScore.textContent = this.highScore;
            }
            const comboText = 'x' + this.comboMultiplier.toFixed(1);
            if (comboValue.textContent !== comboText) {
                comboValue.textContent = comboText;
            }
            if (coinsValue.textContent !== this.coins.toString()) {
                coinsValue.textContent = this.coins;
            }
            const diffText = this.difficultySettings.name.toUpperCase();
            if (difficultyInd.textContent !== diffText) {
                difficultyInd.textContent = diffText;
            }

            // Update power-ups display
            const powerUpKeys = Object.keys(this.activePowerUps);
            if (display.children.length !== powerUpKeys.length) {
                display.innerHTML = '';
                for (let key of powerUpKeys) {
                    const pu = this.activePowerUps[key];
                    const icons = { shield: '🛡', slowMotion: '⏱', magnet: '🧲', doublePoints: '2x', ghost: '👻', speedBoost: '⚡', coin: '💰' };
                    const indicator = document.createElement('div');
                    indicator.className = 'power-up-indicator';
                    indicator.textContent = `${icons[key]} ${Math.ceil(pu.duration / 10)}s`;
                    display.appendChild(indicator);
                }
            }
        } catch (e) {
            // Silent fail - DOM elements may not exist in some contexts
        }
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const cloudOffset = (this.frameCount * 0.3) % this.canvas.width;

        for (let i = 0; i < 3; i++) {
            const x = (cloudOffset + i * 200 - this.canvas.width) % (this.canvas.width + 100);
            const y = 50 + i * 60;
            this.drawCloud(x, y, 40);
        }
    }

    drawCloud(x, y, size) {
        // Main cloud body
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 3, y, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud highlight (lighter top)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x + size * 1.5, y - size * 0.3, size * 1.2, 0, Math.PI);
        this.ctx.fill();
    }

    drawMountains() {
        // Far mountains (darkest, smallest)
        this.ctx.fillStyle = '#5A7A6F';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 480);
        this.ctx.lineTo(60, 420);
        this.ctx.lineTo(120, 480);
        this.ctx.lineTo(180, 440);
        this.ctx.lineTo(240, 480);
        this.ctx.lineTo(300, 450);
        this.ctx.lineTo(360, 480);
        this.ctx.lineTo(400, 460);
        this.ctx.lineTo(400, 480);
        this.ctx.lineTo(0, 480);
        this.ctx.fill();

        // Snow caps on mountains
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(55, 420);
        this.ctx.lineTo(65, 425);
        this.ctx.lineTo(60, 430);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(175, 440);
        this.ctx.lineTo(185, 445);
        this.ctx.lineTo(180, 450);
        this.ctx.fill();

        // Middle mountains (medium)
        this.ctx.fillStyle = '#6B8C7C';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 520);
        this.ctx.lineTo(80, 460);
        this.ctx.lineTo(160, 520);
        this.ctx.lineTo(240, 480);
        this.ctx.lineTo(320, 520);
        this.ctx.lineTo(400, 500);
        this.ctx.lineTo(400, 520);
        this.ctx.lineTo(0, 520);
        this.ctx.fill();

        // Snow caps middle
        this.ctx.fillStyle = '#FFFEF5';
        this.ctx.beginPath();
        this.ctx.moveTo(75, 460);
        this.ctx.lineTo(85, 470);
        this.ctx.lineTo(75, 475);
        this.ctx.fill();
    }

    drawHuts() {
        // Hut 1
        this.drawHut(70, 530);
        // Hut 2
        this.drawHut(320, 545);
    }

    drawHut(x, y) {
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 40, 35, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Hut body (rectangle) with gradient effect
        this.ctx.fillStyle = '#9B7653';
        this.ctx.fillRect(x - 22, y, 44, 25);

        // Darker side for 3D effect
        this.ctx.fillStyle = '#7A5A3F';
        this.ctx.fillRect(x + 15, y, 7, 25);

        // Hut roof (triangle) - brown
        this.ctx.fillStyle = '#B8860B';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 27, y);
        this.ctx.lineTo(x, y - 18);
        this.ctx.lineTo(x + 27, y);
        this.ctx.fill();

        // Roof ridge highlight
        this.ctx.strokeStyle = '#D4AF37';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 20, y - 8);
        this.ctx.lineTo(x, y - 16);
        this.ctx.lineTo(x + 20, y - 8);
        this.ctx.stroke();

        // Door
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x - 7, y + 12, 14, 13);

        // Door knob
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(x + 4, y + 18, 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Window 1
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(x - 18, y + 6, 8, 8);
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 18, y + 6, 8, 8);
        // Window panes
        this.ctx.beginPath();
        this.ctx.moveTo(x - 14, y + 6);
        this.ctx.lineTo(x - 14, y + 14);
        this.ctx.moveTo(x - 18, y + 10);
        this.ctx.lineTo(x - 10, y + 10);
        this.ctx.stroke();

        // Window 2
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(x + 10, y + 6, 8, 8);
        this.ctx.strokeStyle = '#654321';
        this.ctx.strokeRect(x + 10, y + 6, 8, 8);
        // Window panes
        this.ctx.beginPath();
        this.ctx.moveTo(x + 14, y + 6);
        this.ctx.lineTo(x + 14, y + 14);
        this.ctx.moveTo(x + 10, y + 10);
        this.ctx.lineTo(x + 18, y + 10);
        this.ctx.stroke();
    }

    activatePowerUp(type) {
        const settings = this.powerUpTypes[type];

        if (type === 'shield') {
            this.activePowerUps.shield = { duration: settings.duration };
            this.audioManager.playShieldActivateSound();
            this.createExplosionParticles(this.bird.x, this.bird.y);
        } else if (type === 'slowMotion') {
            this.activePowerUps.slowMotion = { duration: settings.duration };
            this.audioManager.playPowerUpSound();
        } else if (type === 'magnet') {
            this.activePowerUps.magnet = { duration: settings.duration };
            this.audioManager.playPowerUpSound();
        } else if (type === 'doublePoints') {
            this.activePowerUps.doublePoints = { duration: settings.duration };
            this.audioManager.playLevelUpSound();
        } else if (type === 'ghost') {
            this.activePowerUps.ghost = { duration: settings.duration, uses: 2 };
            this.audioManager.playPowerUpSound();
        } else if (type === 'speedBoost') {
            this.activePowerUps.speedBoost = { duration: settings.duration };
            this.audioManager.playLevelUpSound();
        }
    }

    createPowerUpParticles(x, y) {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const speed = 3.5;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#FFD700',
                30
            ));
        }
    }

    endGame() {
        this.gameRunning = false;
        this.gameState = 'gameover';

        if (window.CrazyGames && window.CrazyGames.SDK) {
            window.CrazyGames.SDK.game.gameplayStop();
            // Request midroll ad
            const callbacks = {
                adFinished: () => {
                    console.log("End midgame ad");
                    this.audioManager.unmuteAll();
                },
                adError: (error) => {
                    console.log("Error midgame ad", error);
                    this.audioManager.unmuteAll();
                },
                adStarted: () => {
                    console.log("Start midgame ad");
                    this.audioManager.muteAll();
                },
            };
            window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
        }

        // Play game over sound
        this.audioManager.playGameOverSound();

        // Create explosion particles on game over
        this.createExplosionParticles(this.bird.x, this.bird.y);

        // Show game over screen with animation
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.animation = 'fadeInScale 0.5s ease-out';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            if (window.CrazyGames && window.CrazyGames.SDK) {
                window.CrazyGames.SDK.game.happytime();
            }

            // New high score animation
            setTimeout(() => {
                const highScoreEl = document.getElementById('gameOverHighScore');
                highScoreEl.style.animation = 'none';
                setTimeout(() => {
                    highScoreEl.style.animation = 'pulse 0.6s ease-in-out';
                }, 10);
            }, 300);
        }

        // Save to leaderboard
        this.saveScore(this.score);

        // Update stats
        this.sessionStats.totalScore += this.score;
        this.sessionStats.totalCoins += this.coins;
        this.saveStats();

        // Check achievements
        this.checkAchievements();

        // Update game over stats
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverHighScore').textContent = this.highScore;
        document.getElementById('coinsCollected').textContent = this.coins;

        // Update rank display
        const currentRank = this.getCurrentRank();
        const rankDisplay = document.getElementById('rankDisplay');
        document.getElementById('rankIcon').textContent = currentRank.icon;
        document.getElementById('rankName').textContent = currentRank.name;
        document.getElementById('rankName').style.color = currentRank.color;
        document.getElementById('rankProgress').style.width = this.getRankProgress() + '%';
        document.getElementById('rankProgress').style.backgroundColor = currentRank.color;
        rankDisplay.style.borderColor = currentRank.color;

        // Animate stats appearance
        setTimeout(() => {
            document.querySelectorAll('.stat-value').forEach((el, index) => {
                el.style.animation = `slideInUp 0.4s ease-out ${index * 0.1}s both`;
            });
        }, 100);
    }

    loadHighScore() {
        const saved = localStorage.getItem('flappyBirdHighScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('flappyBirdHighScore', this.highScore.toString());
    }

    getTopScores() {
        const saved = localStorage.getItem('flappyBirdScores');
        const scores = saved ? JSON.parse(saved) : [];
        return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    saveScore(score) {
        const scores = this.getTopScores();
        scores.push({
            score,
            character: this.bird.character,
            difficulty: this.difficulty,
            coins: this.coins,
            combo: this.sessionStats.bestCombo,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('flappyBirdScores', JSON.stringify(scores.sort((a, b) => b.score - a.score).slice(0, 20)));
    }

    getCurrentRank() {
        return this.ranks.find(rank => this.score >= rank.minScore && this.score <= rank.maxScore) || this.ranks[0];
    }

    getHighScoreRank() {
        return this.ranks.find(rank => this.highScore >= rank.minScore && this.highScore <= rank.maxScore) || this.ranks[0];
    }

    getRankProgress() {
        const currentRank = this.getCurrentRank();
        const nextRank = this.ranks[this.ranks.indexOf(currentRank) + 1];

        if (!nextRank) return 100; // Legend rank - 100% progress

        const progress = ((this.score - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100;
        return Math.min(progress, 100);
    }

    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const elapsed = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Target 60 FPS, so dt is 1 at 60 FPS
        const dt = elapsed / (1000 / 60);
        this.lastDt = dt;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});
