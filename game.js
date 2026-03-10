// ============================================================================
// AERO DASH: SKY HIGH - Main Game Engine
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

class Floater {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 60;
        this.opacity = 1;
    }
    update(dt) {
        this.y -= 1 * dt;
        this.life -= dt;
        this.opacity = Math.max(0, this.life / 60);
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px Inter';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y, type, settings) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.settings = settings;
        this.width = 30;
        this.height = 30;
        this.pulse = 0;
    }
    update(dt, gameSpeed) {
        this.x -= 4 * gameSpeed * dt;
        this.pulse += 0.1 * dt;
    }
    draw(ctx) {
        ctx.save();
        const bounce = Math.sin(this.pulse) * 5;
        ctx.translate(this.x, this.y + bounce);

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.settings.color;

        ctx.fillStyle = this.settings.color;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.settings.emoji, 0, 0);
        ctx.restore();
    }
}

class AeroCraft {
    constructor(character = 'classic') {
        this.character = character;
        this.x = 100;
        this.y = 200;
        this.width = 36;
        this.height = 24;
        this.velocity = 0;
        this.gravity = 0.25;
        this.flapPower = -6;
        this.maxVelocity = 7;
        this.rotation = 0;
        this.thrusterLife = 0;

        this.characterColors = {
            classic: { body: '#3a7bd5', wing: '#00d2ff', accent: '#fff' },
            golden: { body: '#f09819', wing: '#edde5d', accent: '#fff' },
            ninja: { body: '#232526', wing: '#414345', accent: '#f00' },
            magnet: { body: '#834d9b', wing: '#d04ed6', accent: '#fff' },
            ghost: { body: '#e0e0e0', wing: '#ffffff', accent: '#aaa' },
            eagle: { body: '#4b6cb7', wing: '#182848', accent: '#fff' },
            penguin: { body: '#000000', wing: '#333', accent: '#fff' },
            hummingbird: { body: '#11998e', wing: '#38ef7d', accent: '#fff' },
            phoenix: { body: '#f83600', wing: '#fe8c00', accent: '#ffd700' },
            robot: { body: '#bdc3c7', wing: '#2c3e50', accent: '#00f2fe' },
            robin: { body: '#ff9966', wing: '#ff5e62', accent: '#fff' }
        };
    }

    update(dt = 1, isSlowMo = false) {
        let actualGravity = this.gravity;
        if (isSlowMo) actualGravity *= 0.5;

        this.velocity = Math.min(this.velocity + actualGravity * dt, this.maxVelocity);
        this.y += this.velocity * dt;
        this.rotation = Math.min(this.rotation + 0.05 * dt, Math.PI / 6);
        if (this.thrusterLife > 0) this.thrusterLife -= dt;
    }

    flap() {
        this.velocity = this.flapPower;
        this.rotation = -Math.PI / 6;
        this.thrusterLife = 10;
    }

    draw(ctx) {
        const colors = this.characterColors[this.character] || this.characterColors.classic;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw Aero Craft Body (Sleek Shape)
        const gradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
        gradient.addColorStop(0, colors.body);
        gradient.addColorStop(1, colors.wing);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.lineTo(this.width/2 - 10, -this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(this.width/2 - 10, this.height/2);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();

        // Cockpit / Visor
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(8, -2, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Thruster flame if active
        if (this.thrusterLife > 0) {
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.moveTo(-this.width/2, -5);
            ctx.lineTo(-this.width/2 - 15, 0);
            ctx.lineTo(-this.width/2, 5);
            ctx.fill();

            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(-this.width/2, -3);
            ctx.lineTo(-this.width/2 - 8, 0);
            ctx.lineTo(-this.width/2, 3);
            ctx.fill();
        }

        // Mechanical Wing/Fin
        ctx.fillStyle = colors.body;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-20, -15);
        ctx.lineTo(-5, -15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        ctx.restore();
    }
}

class Pillar {
    constructor(x, gap, gapSize) {
        this.x = x;
        this.gap = gap;
        this.gapSize = gapSize;
        this.width = 70;
        this.speed = 4;
        this.passed = false;
        this.glowPhase = 0;
    }

    update(dt = 1, gameSpeed = 1) {
        this.x -= this.speed * gameSpeed * dt;
        this.glowPhase = (this.glowPhase + 0.05 * dt) % (Math.PI * 2);
    }

    draw(ctx, canvasHeight) {
        const glow = Math.abs(Math.sin(this.glowPhase)) * 15;

        // Pillar Design (Tech Style)
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;

        // Top Pillar
        ctx.shadowBlur = glow;
        ctx.shadowColor = '#00f2fe';
        ctx.fillRect(this.x, 0, this.width, this.gap);
        ctx.strokeRect(this.x, 0, this.width, this.gap);

        // Bottom Pillar
        ctx.fillRect(this.x, this.gap + this.gapSize, this.width, canvasHeight - this.gap - this.gapSize);
        ctx.strokeRect(this.x, this.gap + this.gapSize, this.width, canvasHeight - this.gap - this.gapSize);

        ctx.shadowBlur = 0;

        // Energy Core Details
        ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
        ctx.fillRect(this.x + 10, 0, this.width - 20, this.gap);
        ctx.fillRect(this.x + 10, this.gap + this.gapSize, this.width - 20, canvasHeight - this.gap - this.gapSize);

        // Pulse lines
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
        ctx.beginPath();
        for(let y = 20; y < this.gap; y += 40) {
            ctx.moveTo(this.x + 5, y);
            ctx.lineTo(this.x + this.width - 5, y);
        }
        for(let y = this.gap + this.gapSize + 20; y < canvasHeight; y += 40) {
            ctx.moveTo(this.x + 5, y);
            ctx.lineTo(this.x + this.width - 5, y);
        }
        ctx.stroke();
    }

    isOffScreen() {
        return this.x + this.width < -20;
    }

    collidesWith(bird) {
        const birdLeft = bird.x - bird.width / 2 + 5;
        const birdRight = bird.x + bird.width / 2 - 5;
        const birdTop = bird.y - bird.height / 2 + 5;
        const birdBottom = bird.y + bird.height / 2 - 5;

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

        this.bird = new AeroCraft('classic');
        this.pipes = [];
        this.particles = [];
        this.powerUps = [];
        this.scoreFloaters = [];

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
        this.activePowerUps = {};

        this.sessionStats = {
            gamesPlayed: 0,
            totalScore: 0,
            totalCoins: 0,
            pipesAvoided: 0,
            bestCombo: 0
        };
        this.loadStats();

        this.ranks = [
            { name: 'Rookie Pilot', minScore: 0, maxScore: 49, color: '#888888', icon: '🔰' },
            { name: 'Cadet', minScore: 50, maxScore: 99, color: '#4CAF50', icon: '🌱' },
            { name: 'Aviator', minScore: 100, maxScore: 199, color: '#2196F3', icon: '⭐' },
            { name: 'Elite Pilot', minScore: 200, maxScore: 399, color: '#FF9800', icon: '🏆' },
            { name: 'Commander', minScore: 400, maxScore: 699, color: '#F44336', icon: '🔥' },
            { name: 'Sky Master', minScore: 700, maxScore: 999, color: '#9C27B0', icon: '👑' },
            { name: 'Legendary Ace', minScore: 1000, maxScore: Infinity, color: '#FFD700', icon: '✨' }
        ];

        this.powerUpTypes = {
            shield: { duration: 400, color: '#FFD700', emoji: '🛡' },
            slowMotion: { duration: 400, color: '#00BFFF', emoji: '⏱' },
            magnet: { duration: 600, color: '#FF69B4', emoji: '🧲' },
            doublePoints: { duration: 500, color: '#FFB700', emoji: '2x' },
            ghost: { duration: 250, color: '#E0E0E0', emoji: '👻' },
            speedBoost: { duration: 300, color: '#FF4500', emoji: '⚡' },
            coin: { duration: 0, color: '#FFD700', emoji: '💰' }
        };

        this.difficultySettings = { id: 'easy', name: 'Easy', gapSize: 180, spawnRate: 160 };
        this.gameState = 'menu';
        this.lastTime = 0;
        this.particlesEnabled = true;

        window.addEventListener('click', () => this.handleInput());
        window.addEventListener('keydown', (e) => this.handleKeyInput(e));
        window.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleInput(); }, { passive: false });

        this.initMenu();
        if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.sdkGameLoadingStop();
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
            this.handleInput();
        }
        if (e.code === 'Escape' && this.gameState === 'playing') {
            this.togglePause();
        }
    }

    initMenu() {
        this.populateCharacterSelect();
        this.populateDifficultySelect();
        this.updateMenuRankDisplay();
        this.audioManager.playMenuMusic();

        document.getElementById('playGameBtn').addEventListener('click', () => { this.audioManager.stopMenuMusic(); this.audioManager.playButtonClickSound(); this.startGame(); });
        document.getElementById('settingsBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.showPanel('settingsOverlay'); });
        document.getElementById('leaderboardBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.showPanel('leaderboardOverlay'); });
        document.getElementById('aboutBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.showPanel('aboutOverlay'); });
        document.getElementById('achievementsBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.showPanel('achievementsOverlay'); });

        document.getElementById('resumeBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.togglePause(); });
        document.getElementById('restartBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.startGame(); });
        document.getElementById('mainMenuBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.goToMenu(); });
        document.getElementById('retryBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.startGame(); });
        document.getElementById('menuBtn').addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.goToMenu(); });

        const closeBtns = ['settingsCloseBtn', 'leaderboardCloseBtn', 'aboutCloseBtn', 'achievementsCloseBtn'];
        closeBtns.forEach(id => {
            const btn = document.getElementById(id);
            if(btn) btn.addEventListener('click', () => { this.audioManager.playButtonClickSound(); this.hideAllPanels(); });
        });

        document.getElementById('masterVolume').addEventListener('input', (e) => { this.audioManager.setMasterVolume(e.target.value / 100); document.getElementById('volumeValue').textContent = e.target.value + '%'; });
    }

    showPanel(id) {
        this.hideAllPanels();
        if (id === 'leaderboardOverlay') this.updateLeaderboard();
        if (id === 'achievementsOverlay') this.updateAchievements();
        const el = document.getElementById(id);
        if (el) { el.style.display = 'flex'; el.classList.add('active'); }
    }

    updateLeaderboard() {
        const scores = this.getTopScores();
        const container = document.getElementById('leaderboardEntries');
        if (!container) return;
        container.innerHTML = scores.length ? scores.map((s, i) => `
            <div class="stat-item" style="display:flex; justify-content:space-between; margin-bottom:10px; padding:10px 20px;">
                <span>#${i+1} ${s.name}</span>
                <span style="color:var(--primary-neon); font-weight:900;">${s.score}</span>
            </div>
        `).join('') : '<p style="text-align:center; opacity:0.5;">No scores recorded yet!</p>';
    }

    updateAchievements() {
        const container = document.getElementById('achievementsEntries');
        if (!container) return;
        const achievements = [
            { id: 'first_flight', name: 'First Flight', desc: 'Start your first game', icon: '🚀', goal: 1, current: this.sessionStats.gamesPlayed },
            { id: 'coin_collector', name: 'Energy Hunter', desc: 'Collect 50 energy coins', icon: '💰', goal: 50, current: this.sessionStats.totalCoins },
            { id: 'score_master', name: 'Elite Pilot', desc: 'Reach a high score of 100', icon: '🏆', goal: 100, current: this.highScore },
            { id: 'combo_king', name: 'Combo Master', desc: 'Reach a x5 multiplier', icon: '⚡', goal: 5, current: this.sessionStats.bestCombo }
        ];
        container.innerHTML = achievements.map(a => {
            const progress = Math.min(100, (a.current / a.goal) * 100);
            return `
            <div class="achievement-item" style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:900;">${a.icon} ${a.name}</span>
                    <span style="color:var(--primary-neon); font-size:12px;">${Math.floor(progress)}%</span>
                </div>
                <div style="font-size:10px; opacity:0.6; margin-bottom:8px;">${a.desc}</div>
                <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:2px;">
                    <div style="width:${progress}%; height:100%; background:var(--primary-neon); border-radius:2px;"></div>
                </div>
            </div>`;
        }).join('');
    }

    getTopScores() {
        let scores = JSON.parse(localStorage.getItem('aeroDashScores') || '[]');
        if (this.highScore > 0 && !scores.some(s => s.score === this.highScore)) {
            scores.push({ name: 'YOU', score: this.highScore });
            scores.sort((a,b) => b.score - a.score);
            scores = scores.slice(0, 5);
            localStorage.setItem('aeroDashScores', JSON.stringify(scores));
        }
        return scores;
    }

    hideAllPanels() {
        const panels = ['settingsOverlay', 'leaderboardOverlay', 'aboutOverlay', 'achievementsOverlay', 'pauseMenuOverlay'];
        panels.forEach(id => { const el = document.getElementById(id); if(el) { el.style.display = 'none'; el.classList.remove('active'); } });
    }

    populateCharacterSelect() {
        const characters = [
            { id: 'classic', name: '🚀 Blue Dart' },
            { id: 'golden', name: '✨ Gold Ace' },
            { id: 'ninja', name: '🥷 Stealth X' },
            { id: 'magnet', name: '🧲 Mag-Craft' },
            { id: 'ghost', name: '👻 Phantasm' },
            { id: 'eagle', name: '🦅 Sky Hawk' },
            { id: 'penguin', name: '🐧 Frost Wing' },
            { id: 'robot', name: '🤖 Cyber-X' },
            { id: 'phoenix', name: '🔥 Solar Ace' }
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
            { id: 'easy', name: 'Training', gapSize: 180, spawnRate: 160 },
            { id: 'normal', name: 'Standard', gapSize: 150, spawnRate: 140 },
            { id: 'hard', name: 'Combat', gapSize: 120, spawnRate: 120 },
            { id: 'extreme', name: 'Ace Pilot', gapSize: 100, spawnRate: 100 }
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
    }

    loadStats() { const saved = localStorage.getItem('aeroDashStats'); if (saved) this.sessionStats = JSON.parse(saved); }
    saveStats() { localStorage.setItem('aeroDashStats', JSON.stringify(this.sessionStats)); }
    loadHighScore() { const saved = localStorage.getItem('aeroDashHighScore'); return saved ? parseInt(saved) : 0; }
    saveHighScore() { localStorage.setItem('aeroDashHighScore', this.highScore.toString()); }

    startGame() {
        this.bird = new AeroCraft(this.bird.character);
        this.pipes = []; this.particles = []; this.powerUps = []; this.scoreFloaters = [];
        this.score = 0; this.coins = 0; this.frameCount = 0; this.gameState = 'playing';
        this.comboMultiplier = 1; this.consecutiveScores = 0; this.activePowerUps = {};
        this.sessionStats.gamesPlayed++;
        if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStart();
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        this.hideAllPanels();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gamePaused = true; this.gameState = 'paused';
            document.getElementById('pauseMenuOverlay').style.display = 'flex';
            document.getElementById('pauseMenuOverlay').classList.add('active');
            if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStop();
        } else if (this.gameState === 'paused') {
            this.gamePaused = false; this.gameState = 'playing';
            this.hideAllPanels();
            if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStart();
        }
    }

    goToMenu() {
        this.gameState = 'menu';
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        this.hideAllPanels();
        this.audioManager.playMenuMusic();
        if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStop();
    }

    update(dt = 1) {
        if (this.gameState !== 'playing' || this.gamePaused) return;

        let gameSpeed = 1;
        if (this.activePowerUps.slowMotion) gameSpeed = 0.5;
        if (this.activePowerUps.speedBoost) gameSpeed = 1.5;

        this.frameCount += dt;
        this.bird.update(dt, this.activePowerUps.slowMotion);

        // Trail particles
        if (this.particlesEnabled && Math.floor(this.frameCount) % 2 === 0) {
            this.particles.push(new Particle(this.bird.x - 15, this.bird.y, -2, (Math.random()-0.5), 'rgba(0, 242, 254, 0.5)', 20));
        }

        // Check bounds
        if (this.bird.y > this.canvas.height || this.bird.y < 0) { this.endGame(); return; }

        // Spawn Pillars
        if (Math.floor(this.frameCount) % this.difficultySettings.spawnRate === 0 && Math.floor(this.frameCount) !== Math.floor(this.frameCount - dt)) {
            this.generatePillar();
            // Randomly spawn power-ups or coins
            if (Math.random() < 0.3) this.spawnPowerUp();
        }

        // Update Pillars
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update(dt, gameSpeed);

            if (!this.activePowerUps.ghost && this.pipes[i].collidesWith(this.bird)) {
                if (this.activePowerUps.shield) {
                    delete this.activePowerUps.shield;
                    this.pipes.splice(i, 1);
                    this.scoreFloaters.push(new Floater(this.bird.x, this.bird.y, "SHIELD BROKEN", "#FFD700"));
                    continue;
                }
                this.endGame(); return;
            }

            if (!this.pipes[i].passed && this.pipes[i].x + this.pipes[i].width < this.bird.x) {
                this.pipes[i].passed = true;
                let points = 1 * this.comboMultiplier;
                if (this.activePowerUps.doublePoints) points *= 2;
                this.score += points;
                this.consecutiveScores++;
                this.sessionStats.pipesAvoided++;

                // Combo logic
                if (this.consecutiveScores % 5 === 0) {
                    this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
                    this.scoreFloaters.push(new Floater(this.bird.x, this.bird.y - 40, `COMBO x${this.comboMultiplier}`, "#00f2fe"));
                }

                this.audioManager.playPointSound();
                if (this.score % 10 === 0 && window.CrazyGames?.SDK) window.CrazyGames.SDK.game.happytime();
            }
            if (this.pipes[i].isOffScreen()) this.pipes.splice(i, 1);
        }

        // Update Powerups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.update(dt, gameSpeed);

            // Magnet logic
            if (this.activePowerUps.magnet && (p.type === 'coin')) {
                const dx = this.bird.x - p.x;
                const dy = this.bird.y - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    p.x += (dx / dist) * 8 * dt;
                    p.y += (dy / dist) * 8 * dt;
                }
            }

            // Collision
            if (Math.abs(p.x - this.bird.x) < 30 && Math.abs(p.y - this.bird.y) < 30) {
                this.applyPowerUp(p.type);
                this.powerUps.splice(i, 1);
                continue;
            }
            if (p.x < -50) this.powerUps.splice(i, 1);
        }

        // Power-up durations
        for (const type in this.activePowerUps) {
            this.activePowerUps[type] -= dt;
            if (this.activePowerUps[type] <= 0) delete this.activePowerUps[type];
        }

        // Update others
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
        for (let i = this.scoreFloaters.length - 1; i >= 0; i--) {
            this.scoreFloaters[i].update(dt);
            if (this.scoreFloaters[i].life <= 0) this.scoreFloaters.splice(i, 1);
        }
    }

    generatePillar() {
        const gapSize = this.difficultySettings.gapSize;
        const gap = Math.random() * (this.canvas.height - gapSize - 150) + 75;
        this.pipes.push(new Pillar(this.canvas.width, gap, gapSize));
    }

    spawnPowerUp() {
        const types = Object.keys(this.powerUpTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        const y = Math.random() * (this.canvas.height - 100) + 50;
        this.powerUps.push(new PowerUp(this.canvas.width + 100, y, type, this.powerUpTypes[type]));
    }

    applyPowerUp(type) {
        if (type === 'coin') {
            this.coins++;
            this.sessionStats.totalCoins++;
            this.scoreFloaters.push(new Floater(this.bird.x, this.bird.y, "+1 COIN", "#FFD700"));
            this.audioManager.playCoinCollectSound();
            return;
        }

        this.activePowerUps[type] = this.powerUpTypes[type].duration;
        this.scoreFloaters.push(new Floater(this.bird.x, this.bird.y, type.toUpperCase(), this.powerUpTypes[type].color));

        switch(type) {
            case 'shield': this.audioManager.playShieldActivateSound(); break;
            case 'slowMotion': this.audioManager.playSlowMotionSound(); break;
            case 'magnet': this.audioManager.playMagnetSound(); break;
            case 'speedBoost': this.audioManager.playSpeedBoostSound(); break;
            default: this.audioManager.playPowerUpSound(); break;
        }
    }

    draw() {
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Background Grid
        this.ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
        this.ctx.lineWidth = 1;
        for(let x = 0; x < this.canvas.width; x += 40) { this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke(); }
        for(let y = 0; y < this.canvas.height; y += 40) { this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke(); }

        if (this.gameState === 'menu') return;

        for (const pipe of this.pipes) pipe.draw(this.ctx, this.canvas.height);
        for (const p of this.powerUps) p.draw(this.ctx);
        for (const particle of this.particles) particle.draw(this.ctx);
        this.bird.draw(this.ctx);
        for (const f of this.scoreFloaters) f.draw(this.ctx);

        this.updateUIDisplay();
    }

    updateUIDisplay() {
        document.getElementById('scoreValue').textContent = Math.floor(this.score);
        document.getElementById('highScoreValue').textContent = this.highScore;
        document.getElementById('comboValue').textContent = `x${this.comboMultiplier}`;
        document.getElementById('coinsValue').textContent = this.coins;
        document.getElementById('difficultyIndicator').textContent = this.difficultySettings.name.toUpperCase();

        // Power-ups display
        const container = document.getElementById('powerUpsDisplay');
        if (container) {
            container.innerHTML = '';
            for (const type in this.activePowerUps) {
                const div = document.createElement('div');
                div.className = 'power-up-indicator';
                div.style.color = this.powerUpTypes[type].color;
                div.textContent = `${this.powerUpTypes[type].emoji} ${Math.ceil(this.activePowerUps[type] / 60)}s`;
                container.appendChild(div);
            }
        }
    }

    endGame() {
        this.gameState = 'gameover';
        if (window.CrazyGames && window.CrazyGames.SDK) {
            window.CrazyGames.SDK.game.gameplayStop();
            window.CrazyGames.SDK.ad.requestAd("midgame", {
                adFinished: () => this.audioManager.unmuteAll(),
                adError: () => this.audioManager.unmuteAll(),
                adStarted: () => this.audioManager.muteAll(),
            });
        }
        this.audioManager.playGameOverSound();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            if (window.CrazyGames?.SDK) window.CrazyGames.SDK.game.happytime();
        }

        this.sessionStats.totalScore += this.score;
        this.sessionStats.bestCombo = Math.max(this.sessionStats.bestCombo, this.comboMultiplier);
        this.saveStats();
        this.updateGameOverScreen();
    }

    updateGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'flex';
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('gameOverHighScore').textContent = this.highScore;
        document.getElementById('coinsCollected').textContent = this.coins;

        // Rank Progress
        const rank = this.ranks.find(r => this.highScore >= r.minScore && this.highScore <= r.maxScore) || this.ranks[0];
        document.getElementById('rankIcon').textContent = rank.icon;
        document.getElementById('rankName').textContent = rank.name;

        const nextRank = this.ranks[this.ranks.indexOf(rank) + 1];
        if (nextRank) {
            const progress = ((this.highScore - rank.minScore) / (nextRank.minScore - rank.minScore)) * 100;
            document.getElementById('rankProgress').style.width = `${Math.min(100, progress)}%`;
        } else {
            document.getElementById('rankProgress').style.width = '100%';
        }
    }

    updateMenuRankDisplay() {
        const rank = this.ranks.find(r => this.highScore >= r.minScore && this.highScore <= r.maxScore) || this.ranks[0];
        document.getElementById('menuRankIcon').textContent = rank.icon;
        document.getElementById('menuRankText').textContent = rank.name;
    }

    gameLoop(timestamp) {
        const dt = (timestamp - (this.lastTime || timestamp)) / (1000 / 60);
        this.lastTime = timestamp;
        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => { new Game(document.getElementById('gameCanvas')); });
