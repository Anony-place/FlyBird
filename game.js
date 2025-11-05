// ============================================================================
// FLAPPY BIRD ULTIMATE - Main Game Engine
// ============================================================================
// Dependencies: audio.js (AudioManager)

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

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
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
        this.width = 30;
        this.height = 25;
        this.velocity = 0;
        this.gravity = 0.25;
        this.flapPower = -6;
        this.maxVelocity = 7;
        this.rotation = 0;
        this.wingFlap = 0; // Wing animation frame
        this.characterColors = {
            classic: { body: '#FFD700', wing: '#FFA500' },
            golden: { body: '#FFD700', wing: '#FFB700' },
            ninja: { body: '#333', wing: '#555' },
            magnet: { body: '#FF69B4', wing: '#FF1493' },
            ghost: { body: '#E0E0E0', wing: '#B0B0B0' },
            eagle: { body: '#8B4513', wing: '#654321' },
            penguin: { body: '#000', wing: '#333' },
            hummingbird: { body: '#4CAF50', wing: '#45a049' },
            phoenix: { body: '#FF6347', wing: '#FF4500' },
            robot: { body: '#C0C0C0', wing: '#808080' },
            robin: { body: '#E07856', wing: '#4A8B7C' }
        };
    }

    update() {
        this.velocity = Math.min(this.velocity + this.gravity, this.maxVelocity);
        this.y += this.velocity;
        this.rotation = Math.min(this.rotation + 0.05, Math.PI / 6);
        this.wingFlap = (this.wingFlap + 0.1) % (Math.PI * 2); // Smooth wing animation
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

        // Draw body with gradient
        ctx.fillStyle = colors.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body shading for 3D effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(2, 2, this.width / 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(9, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine for life
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(10, -6, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Draw animated wings
        ctx.fillStyle = colors.wing;
        const wingRotation = Math.sin(this.wingFlap) * 0.2; // Wing oscillation
        ctx.beginPath();
        ctx.ellipse(-8, 0, 8, 12, -0.3 + wingRotation, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-7, -3, 5, 8, -0.3 + wingRotation, 0, Math.PI * 2);
        ctx.fill();

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
        this.width = 60;
        this.speed = 4;
        this.passed = false;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx, canvasHeight) {
        ctx.fillStyle = '#4CAF50';
        
        // Top pipe
        ctx.fillRect(this.x, 0, this.width, this.gap);
        
        // Bottom pipe
        ctx.fillRect(this.x, this.gap + this.gapSize, this.width, canvasHeight - this.gap - this.gapSize);

        // Pipe decoration - gradient effect
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(this.x - 2, this.gap - 10, this.width + 4, 10);
        ctx.fillRect(this.x - 2, this.gap + this.gapSize, this.width + 4, 10);
        
        // Pipe shine/highlight for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(this.x + 2, 0, 3, this.gap);
        ctx.fillRect(this.x + 2, this.gap + this.gapSize, 3, canvasHeight - this.gap - this.gapSize);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(bird) {
        const birdLeft = bird.x - bird.width / 2;
        const birdRight = bird.x + bird.width / 2;
        const birdTop = bird.y - bird.height / 2;
        const birdBottom = bird.y + bird.height / 2;

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

        this.gameState = 'menu'; // menu, playing, paused, gameover
        
        window.addEventListener('click', () => this.handleInput());
        window.addEventListener('keydown', (e) => this.handleKeyInput(e));
        window.addEventListener('touchstart', () => this.handleInput());

        this.initMenu();
        this.gameLoop();
    }

    setCanvasSize() {
        this.canvas.width = 400;
        this.canvas.height = 640;
    }

    handleInput() {
        if (this.gameState === 'playing') {
            this.bird.flap();
            this.audioManager.playFlapSound();
        }
    }

    handleKeyInput(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.bird.flap();
                this.audioManager.playFlapSound();
            }
        }
        if (e.code === 'Escape' && this.gameState === 'playing') {
            this.togglePause();
        }
    }

    initMenu() {
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
        document.getElementById('watchAdBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.showRewardedAd();
        });
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.goToMenu();
        });
        document.getElementById('watchAdBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.showRewardedAd();
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

        document.getElementById('leaderboardCloseBtn').addEventListener('click', () => {
            this.audioManager.playButtonClickSound();
            this.hideLeaderboard();
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

        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseMenuOverlay').classList.remove('active');
        document.getElementById('leaderboardOverlay').classList.remove('active');
        document.getElementById('settingsOverlay').classList.remove('active');
        document.getElementById('aboutOverlay').classList.remove('active');
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gamePaused = true;
            this.gameState = 'paused';
            document.getElementById('pauseMenuOverlay').classList.add('active');
        } else if (this.gameState === 'paused') {
            this.gamePaused = false;
            this.gameState = 'playing';
            document.getElementById('pauseMenuOverlay').classList.remove('active');
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
    }
    
    showRewardedAd() {
        if (typeof adMobManager !== 'undefined') {
            const previousCoins = this.coins;
            adMobManager.showRewardedAd(() => {
                // Reward callback: Add 50 coins
                this.coins += 50;
                this.sessionStats.totalCoins += 50;
                this.saveStats();
                
                // Update UI
                document.getElementById('coinsCollected').textContent = this.coins;
                this.createScoreFloater(this.canvas.width / 2, 100, '+50 💰');
                this.audioManager.playCoinCollectSound();
                
                console.log('Rewarded: +50 coins');
            });
        } else {
            // Fallback if AdMob not available
            this.coins += 50;
            this.sessionStats.totalCoins += 50;
            this.saveStats();
            document.getElementById('coinsCollected').textContent = this.coins;
        }
    }

    updateMenuRankDisplay() {
        const highScoreRank = this.getHighScoreRank();
        document.getElementById('menuRankIcon').textContent = highScoreRank.icon;
        document.getElementById('menuRankText').textContent = highScoreRank.name;
        document.getElementById('menuRankText').style.color = highScoreRank.color;
    }

    showSettings() {
        document.getElementById('settingsOverlay').classList.add('active');
    }

    hideSettings() {
        document.getElementById('settingsOverlay').classList.remove('active');
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

    update() {
        if (!this.gameRunning || this.gamePaused) return;

        this.frameCount++;
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake--;
        }

        // Update bird
        this.bird.update();
        
        // Update score floaters
        for (let i = this.scoreFloaters.length - 1; i >= 0; i--) {
            this.scoreFloaters[i].y -= 2;
            this.scoreFloaters[i].alpha -= 0.02;
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
        if (this.frameCount % spawnRate === 0) {
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
            this.pipes[i].update();

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
                } else if (this.activePowerUps.ghost) {
                    this.activePowerUps.ghost.uses--;
                    if (this.activePowerUps.ghost.uses <= 0) {
                        delete this.activePowerUps.ghost;
                    }
                }
            }

            // Check score
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
            this.activePowerUps[key].duration--;
            if (this.activePowerUps[key].duration <= 0) {
                delete this.activePowerUps[key];
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Randomly spawn power-ups with increased frequency
        if (Math.random() < 0.015) {
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
        if (this.screenShake > 0) {
            const offsetX = (Math.random() - 0.5) * this.screenShakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.screenShakeIntensity;
            this.ctx.translate(offsetX, offsetY);
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
            return;
        }

        // Draw pipes
        for (const pipe of this.pipes) {
            pipe.draw(this.ctx, this.canvas.height);
        }

        // Draw power-ups
        if (this.powerUps && this.powerUps.length > 0) {
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const pu = this.powerUps[i];
                pu.x -= pu.speed;
                pu.rotation = (pu.rotation + 0.05) % (Math.PI * 2);

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
                if (pu.x + pu.width < 0) {
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

        // Update UI
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('highScoreValue').textContent = this.highScore;
        document.getElementById('comboValue').textContent = 'x' + this.comboMultiplier.toFixed(1);
        document.getElementById('coinsValue').textContent = this.coins;
        document.getElementById('difficultyIndicator').textContent = this.difficultySettings.name.toUpperCase();

        // Draw active power-ups indicator
        const display = document.getElementById('powerUpsDisplay');
        display.innerHTML = '';
        for (let key in this.activePowerUps) {
            const pu = this.activePowerUps[key];
            const icons = { shield: '🛡', slowMotion: '⏱', magnet: '🧲', doublePoints: '2x', ghost: '👻', speedBoost: '⚡', coin: '💰' };
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator';
            indicator.textContent = `${icons[key]} ${Math.ceil(pu.duration / 10)}s`;
            display.appendChild(indicator);
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

        // Play game over sound
        this.audioManager.playGameOverSound();
        
        // Create explosion particles on game over
        this.createExplosionParticles(this.bird.x, this.bird.y);

        // Show interstitial ad after every 2-3 games
        if (typeof adMobManager !== 'undefined' && Math.random() < 0.4) {
            setTimeout(() => {
                adMobManager.showInterstitialAd();
            }, 500);
        }

        // Save high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            
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

        // Show game over screen with animation
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.animation = 'fadeInScale 0.5s ease-out';
        
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

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});
