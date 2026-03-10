/**
 * Aero Dash: Sky High - Ultimate Professional Edition
 * Optimized for CrazyGames with high-fidelity juice and depth.
 */

class AeroCraft {
    constructor(canvas, themeColor) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.themeColor = themeColor || '#00f2ff';
        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 4;
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.gravity = 0.6;
        this.jump = -8;
        this.radius = 15;
        this.rotation = 0;
        this.particles = [];
        this.pulse = 0;
        this.shielded = false;
        this.magnetized = false;
    }

    update(dt) {
        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));

        // Trail particles
        if (Math.random() > 0.4) {
            this.particles.push({
                x: this.x - 10,
                y: this.y,
                vx: -2 - Math.random() * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1.0,
                size: Math.random() * 5 + 2
            });
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 0.04 * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.pulse += 0.1 * dt;
    }

    draw() {
        const ctx = this.ctx;

        // Shield Effect
        if (this.shielded) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 25 + Math.sin(this.pulse * 2) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life * 0.7;
            ctx.fillStyle = this.themeColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Glow
        ctx.shadowBlur = 15 + Math.sin(this.pulse) * 5;
        ctx.shadowColor = this.themeColor;


        // Wing Shape
        let grad = ctx.createLinearGradient(-15, 0, 15, 0);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, this.themeColor);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(3, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class Pillar {
    constructor(canvas, x, themeColor) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.width = 65;
        this.gap = 170;
        this.top = Math.random() * (canvas.height - this.gap - 120) + 60;
        this.bottom = canvas.height - (this.top + this.gap);
        this.passed = false;
        this.color = themeColor;
        this.anim = 0;
    }

    update(dt, speed) {
        this.x -= speed * dt;
        this.anim += 0.05 * dt;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        let grad = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, this.color);
        grad.addColorStop(1, '#0a0a1a');

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = grad;

        this.roundRect(ctx, this.x, 0, this.width, this.top, 8);
        ctx.fill();
        this.roundRect(ctx, this.x, canvas.height - this.bottom, this.width, this.bottom, 8);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.2;
        let stripeY = (this.anim * 25) % 50;
        for(let y = stripeY; y < this.top; y += 50) {
            ctx.beginPath(); ctx.moveTo(this.x, y); ctx.lineTo(this.x + this.width, y); ctx.stroke();
        }
        for(let y = canvas.height - this.bottom + stripeY; y < canvas.height; y += 50) {
            ctx.beginPath(); ctx.moveTo(this.x, y); ctx.lineTo(this.x + this.width, y); ctx.stroke();
        }

        ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

class Coin {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.pulse = 0;
    }

    update(dt, speed, craft) {
        if (craft.magnetized) {
            let dx = craft.x - this.x;
            let dy = craft.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x += (dx / dist) * 10 * dt;
                this.y += (dy / dist) * 10 * dt;
            } else {
                this.x -= speed * dt;
            }
        } else {
            this.x -= speed * dt;
        }
        this.pulse += 0.1 * dt;
    }

    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';
        ctx.scale(Math.sin(this.pulse), 1);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PowerUp {
    constructor(canvas, x, y, type) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.type = type; // shield, magnet, slowmo
        this.radius = 15;
        this.collected = false;
        this.pulse = 0;
    }

    update(dt, speed) {
        this.x -= speed * dt;
        this.pulse += 0.1 * dt;
    }

    draw() {
        const ctx = this.ctx;
        let color = '#fff';
        let icon = '?';
        if (this.type === 'shield') { color = '#00ff00'; icon = '🛡️'; }
        if (this.type === 'magnet') { color = '#ff00ff'; icon = '🧲'; }
        if (this.type === 'slowmo') { color = '#ffff00'; icon = '⏱️'; }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + Math.sin(this.pulse) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, 0);
        ctx.restore();
    }
}

class ScoreFloater {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color || '#fff';
        this.life = 1.0;
    }
    update(dt) {
        this.y -= 2 * dt;
        this.life -= 0.02 * dt;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px Arial';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // --- ECOSYSTEM STATE ---
        this.state = JSON.parse(localStorage.getItem('aeroDashState')) || {
            coins: 0,
            gems: 0,
            level: 1,
            xp: 0,
            highScore: 0,
            unlockedCrafts: ['swift'],
            selectedCraft: 'swift',
            upgrades: {
                shield: 1,
                magnet: 1,
                slowmo: 1
            },
            stats: {
                totalTime: 0,
                totalDist: 0,
                totalCoins: 0,
                maxCombo: 0
            },
            lastLogin: Date.now(),
            dailyQuests: this.generateQuests()
        };

        this.characters = [
            { id: 'swift', name: 'Swift-X', color: '#00f2fe', emoji: '🚀', price: 0 },
            { id: 'neon', name: 'Neon-Volt', color: '#ff00ff', emoji: '⚡', price: 500 },
            { id: 'emerald', name: 'Emerald-Jet', color: '#00ff88', emoji: '💎', price: 1200 },
            { id: 'gold', name: 'Midas-1', color: '#ffcc00', emoji: '🏆', price: 3000 }
        ];

        this.zones = [
            { id: 'neon', name: 'NEON CITY', color: '#00f2fe', gravity: 0.6, speed: 4.5 },
            { id: 'void', name: 'DARK VOID', color: '#9d00ff', gravity: 0.8, speed: 5.5 },
            { id: 'inferno', name: 'INFERNO', color: '#ff4b2b', gravity: 0.5, speed: 7.0 }
        ];
        this.currentZoneIdx = 0;

        this.selectedChar = this.characters.find(c => c.id === this.state.selectedCraft) || this.characters[0];

        this.craft = new AeroCraft(this.canvas, this.selectedChar.color);
        this.pillars = [];
        this.coins = [];
        this.powerups = [];
        this.floaters = [];
        this.stars = this.initStars();

        this.score = 0;
        this.combo = 1;
        this.gameState = 'START';
        this.lastTime = 0;
        this.shake = 0;
        this.hitStop = 0;
        this.flash = 0;
        this.activePowerups = {};

        this.initUI();
        this.initInput();
        this.showMenu();
        requestAnimationFrame((t) => this.loop(t));

        const splash = document.getElementById('startingAnimation');
        splash.onclick = () => splash.style.display = 'none';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 2000);
    }

    saveState() {
        localStorage.setItem('aeroDashState', JSON.stringify(this.state));
    }

    generateQuests() {
        const today = new Date().toDateString();
        if (this.state && this.state.questDate === today) return this.state.dailyQuests;

        const pool = [
            { id: 1, text: "Collect 50 Energy Cells", goal: 50, reward: 200, type: 'coins' },
            { id: 2, text: "Reach Score 20 in one run", goal: 20, reward: 500, type: 'xp' },
            { id: 3, text: "Use 5 Power-ups", goal: 5, reward: 50, type: 'gems' },
            { id: 4, text: "Fly for 120 seconds", goal: 120, reward: 300, type: 'coins' },
            { id: 5, text: "Reach x5 Combo", goal: 5, reward: 100, type: 'gems' }
        ];

        // Pick 3 random quests
        const selected = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
        if (this.state) this.state.questDate = today;
        return selected.map(q => ({ ...q, progress: 0, done: false }));
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    initStars() {
        let layers = [[], [], []];
        for (let i = 0; i < 80; i++) {
            layers[0].push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, s: Math.random() * 2 });
            layers[1].push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, s: Math.random() * 1.5 });
            layers[2].push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, s: Math.random() * 1 });
        }
        return layers;
    }

    initUI() {
        // Tab Logic
        document.querySelectorAll('.lobby-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
                if (window.audioManager) window.audioManager.playSound('thrust');
                if (tab.dataset.tab === 'shop') this.renderShop();
                if (tab.dataset.tab === 'quests') this.renderQuests();
                if (tab.dataset.tab === 'stats') this.renderStats();
            };
        });

        // Zone Logic
        document.querySelector('.prev-zone').onclick = () => this.changeZone(-1);
        document.querySelector('.next-zone').onclick = () => this.changeZone(1);

        document.getElementById('highScoreValue').innerText = this.state.highScore;
        document.getElementById('gameOverHighScore').innerText = this.state.highScore;
    }

    changeZone(dir) {
        this.currentZoneIdx = (this.currentZoneIdx + dir + this.zones.length) % this.zones.length;
        const zone = this.zones[this.currentZoneIdx];
        document.getElementById('currentZoneName').innerText = zone.name;
        document.getElementById('currentZoneName').style.color = zone.color;
        if (window.audioManager) window.audioManager.playSound('thrust');
    }

    refreshLobby() {
        document.getElementById('navCoins').innerText = this.state.coins;
        document.getElementById('navGems').innerText = this.state.gems;
        document.getElementById('playerLevel').innerText = this.state.level;

        const xpThreshold = this.state.level * 1000;
        const xpPercent = (this.state.xp / xpThreshold) * 100;
        document.getElementById('xpBarFill').style.width = xpPercent + '%';

        document.getElementById('lobbyCraftPreview').innerText = this.selectedChar.emoji;
        document.getElementById('lobbyCraftPreview').style.filter = `drop-shadow(0 0 30px ${this.selectedChar.color})`;

        const ranks = ['ROOKIE', 'PILOT', 'ACE', 'LEGEND', 'SKY GOD'];
        const rankIdx = Math.min(ranks.length - 1, Math.floor(this.state.level / 5));
        document.getElementById('lobbyRankName').innerText = ranks[rankIdx];
        this.saveState();
    }

    renderShop() {
        const craftGrid = document.getElementById('craftShopGrid');
        craftGrid.innerHTML = '';
        this.characters.forEach(char => {
            const isUnlocked = this.state.unlockedCrafts.includes(char.id);
            const isSelected = this.state.selectedCraft === char.id;

            const item = document.createElement('div');
            item.className = `shop-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
            item.innerHTML = `
                <div class="item-visual">${char.emoji}</div>
                <div class="item-name">${char.name}</div>
                <div class="item-price">${isUnlocked ? (isSelected ? 'EQUIPPED' : 'OWNED') : '💰 ' + char.price}</div>
            `;
            item.onclick = () => {
                if (isUnlocked) {
                    this.state.selectedCraft = char.id;
                    this.selectedChar = char;
                    this.craft.themeColor = char.color;
                } else if (this.state.coins >= char.price) {
                    this.state.coins -= char.price;
                    this.state.unlockedCrafts.push(char.id);
                    if (window.audioManager) window.audioManager.playSound('score');
                }
                this.refreshLobby();
                this.renderShop();
            };
            craftGrid.appendChild(item);
        });

        const upgradeGrid = document.getElementById('upgradeShopGrid');
        upgradeGrid.innerHTML = '';
        const upgrades = [
            { id: 'shield', name: 'Shield Duration', icon: '🛡️' },
            { id: 'magnet', name: 'Magnet Range', icon: '🧲' },
            { id: 'slowmo', name: 'Slow-Mo Time', icon: '⏱️' }
        ];
        upgrades.forEach(u => {
            const level = this.state.upgrades[u.id];
            const price = level * 1000;
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-visual">${u.icon}</div>
                <div class="item-name">${u.name}</div>
                <div class="item-price">💰 ${price} (LVL ${level})</div>
            `;
            item.onclick = () => {
                if (this.state.coins >= price) {
                    this.state.coins -= price;
                    this.state.upgrades[u.id]++;
                    if (window.audioManager) window.audioManager.playSound('score');
                    this.refreshLobby();
                    this.renderShop();
                }
            };
            upgradeGrid.appendChild(item);
        });
    }

    renderQuests() {
        const list = document.getElementById('dailyQuestList');
        list.innerHTML = this.state.dailyQuests.map(q => `
            <div class="quest-card ${q.done ? 'completed' : ''}">
                <div class="quest-info">
                    <div class="quest-title">${q.text}</div>
                    <div class="quest-progress-container">
                        <div class="quest-progress-fill" style="width: ${(q.progress / q.goal) * 100}%"></div>
                    </div>
                    <div class="quest-reward">+${q.reward} ${q.type.toUpperCase()}</div>
                </div>
                <div class="quest-status">${q.done ? '✅' : q.progress + '/' + q.goal}</div>
            </div>
        `).join('');
    }

    renderStats() {
        document.getElementById('statTime').innerText = Math.floor(this.state.stats.totalTime / 60) + 'm ' + (this.state.stats.totalTime % 60) + 's';
        document.getElementById('statDist').innerText = Math.floor(this.state.stats.totalDist) + 'm';
        document.getElementById('statCoins').innerText = this.state.stats.totalCoins;
        document.getElementById('statCombo').innerText = 'x' + this.state.stats.maxCombo;
    }

    initInput() {
        const handleInput = (e) => {
            if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
            if (this.gameState === 'PLAYING') {
                this.craft.velocity = this.craft.jump;
                if (window.audioManager) window.audioManager.playSound('thrust');
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') handleInput();
            if (e.code === 'Escape' && this.gameState === 'PLAYING') this.pauseGame();
        });
        this.canvas.addEventListener('mousedown', handleInput);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput();
        }, { passive: false });

        document.getElementById('playGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('pauseBtnInGame').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('reviveBtn').addEventListener('click', () => this.reviveWithAd());

        // Modals
        const setupModal = (btnId, overlayId, closeId) => {
            const btn = document.getElementById(btnId);
            const overlay = document.getElementById(overlayId);
            const close = document.getElementById(closeId);
            if(btn) btn.onclick = () => overlay.classList.add('active');
            if(close) close.onclick = () => overlay.classList.remove('active');
            if(overlay) overlay.onclick = (e) => { if(e.target === overlay) overlay.classList.remove('active'); };
        };

        setupModal('settingsBtn', 'settingsOverlay', 'settingsCloseBtn');
        setupModal('leaderboardBtn', 'leaderboardOverlay', 'leaderboardCloseBtn');
        setupModal('achievementsBtn', 'achievementsOverlay', 'achievementsCloseBtn');
        setupModal('aboutBtn', 'aboutOverlay', 'aboutCloseBtn');

        // Settings logic
        const volSlider = document.getElementById('masterVolume');
        if (volSlider) {
            volSlider.oninput = (e) => {
                const vol = e.target.value / 100;
                if (window.audioManager) window.audioManager.masterVolume = vol;
                document.getElementById('volumeValue').innerText = e.target.value + '%';
            };
        }

        // Leaderboard logic
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            const entries = document.getElementById('leaderboardEntries');
            entries.innerHTML = '<div style="padding: 20px; text-align: center;">Loading Global Rankings...</div>';
            setTimeout(() => {
                entries.innerHTML = `
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>1. CyberPilot</span> <span>9,430</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>2. NeonWing</span> <span>8,120</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>3. YOU</span> <span>${this.state.highScore}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>4. StarDash</span> <span>4,200</span></div>
                `;
            }, 500);
        });

        // Achievement logic
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            const entries = document.getElementById('achievementsEntries');
            const list = [
                { n: 'First Flight', d: 'Start your first run', c: true },
                { n: 'Coin Collector', d: 'Gather 100 coins total', c: this.state.stats.totalCoins >= 100 },
                { n: 'Ace Pilot', d: 'Reach a score of 50', c: this.state.highScore >= 50 },
                { n: 'Combo Master', d: 'Get a 10x combo', c: false }
            ];
            entries.innerHTML = list.map(a => `
                <div style="padding: 15px; margin-bottom: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; border-left: 4px solid ${a.c ? '#00f2ff' : '#333'}">
                    <div style="font-weight: bold; color: ${a.c ? '#fff' : '#666'}">${a.n} ${a.c ? '✅' : '🔒'}</div>
                    <div style="font-size: 12px; color: #888">${a.d}</div>
                </div>
            `).join('');
        });
    }

    startGame() {
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStart();
        }
        this.canRevive = true;
        document.getElementById('reviveBtn').style.display = 'none';
        const zone = this.zones[this.currentZoneIdx];

        // Update background style
        const container = document.querySelector('.game-container');
        container.className = 'game-container zone-' + zone.id;

        this.gameState = 'PLAYING';
        this.score = 0;
        this.combo = 1;
        this.pillars = [];
        this.coins = [];
        this.powerups = [];
        this.floaters = [];
        this.activePowerups = {};
        this.gameSpeed = zone.speed;
        this.startTime = Date.now();
        this.coinsInRun = 0;

        this.craft.reset();
        this.craft.gravity = zone.gravity;

        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('topNavBar').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'flex';
        document.getElementById('gameUI').style.opacity = '1';
        this.updateUI();
    }

    pauseGame() {
        if (this.gameState !== 'PLAYING') return;
        this.gameState = 'PAUSED';
        document.getElementById('pauseMenuOverlay').classList.add('active');
        if (window.audioManager) window.audioManager.mute();
    }

    resumeGame() {
        this.gameState = 'PLAYING';
        document.getElementById('pauseMenuOverlay').classList.remove('active');
        if (window.audioManager) window.audioManager.unmute();
    }

    gameOver() {
        if (this.gameState === 'GAMEOVER') return;

        if (this.craft.shielded) {
            this.craft.shielded = false;
            this.activePowerups['shield'] = 0;
            this.shake = 10;
            this.hitStop = 5;
            this.flash = 10;
            if (window.audioManager) window.audioManager.playSound('hit');
            return;
        }

        this.gameState = 'GAMEOVER';
        this.shake = 20;
        this.hitStop = 12;
        if (window.audioManager) window.audioManager.playSound('hit');

        // ECOSYSTEM UPDATES
        const runTime = Math.floor((Date.now() - this.startTime) / 1000);
        const xpGained = (this.score * 10) + (this.coinsInRun * 5) + (runTime * 2);

        this.state.xp += xpGained;
        this.state.coins += this.coinsInRun;
        this.state.stats.totalTime += runTime;
        this.state.stats.totalDist += runTime * this.gameSpeed;
        this.state.stats.totalCoins += this.coinsInRun;
        this.state.stats.maxCombo = Math.max(this.state.stats.maxCombo, this.combo);

        if (this.score > this.state.highScore) {
            this.state.highScore = this.score;
        }

        // Level Up Logic (Multi-level support)
        let leveledUp = false;
        while (this.state.xp >= (this.state.level * 1000)) {
            this.state.xp -= (this.state.level * 1000);
            this.state.level++;
            this.state.gems += 10;
            leveledUp = true;
        }
        if (leveledUp) {
            this.floaters.push(new ScoreFloater(this.canvas.width/2, this.canvas.height/2, 'LEVEL UP!', '#00f2fe'));
            if (window.audioManager) window.audioManager.playSound('score');
        }

        // Quest Progress
        this.state.dailyQuests.forEach(q => {
            if (q.done) return;
            if (q.id === 1) q.progress += this.coinsInRun;
            if (q.id === 2) q.progress = Math.max(q.progress, this.score);
            if (q.id === 4) q.progress += runTime;
            if (q.id === 5) q.progress = Math.max(q.progress, this.combo);

            if (q.done === false && q.progress >= q.goal) {
                q.done = true;
                if (q.type === 'coins') this.state.coins += q.reward;
                if (q.type === 'xp') this.state.xp += q.reward;
                if (q.type === 'gems') this.state.gems += q.reward;
            }
        });

        this.saveState();
        this.refreshLobby();

        document.getElementById('finalScore').innerText = this.score;
        document.getElementById('gameOverHighScore').innerText = this.state.highScore;
        document.getElementById('coinsCollected').innerText = this.coinsInRun;

        const ranks = ['ROOKIE', 'PILOT', 'ACE', 'LEGEND', 'SKY GOD'];
        const rankIdx = Math.min(ranks.length - 1, Math.floor(this.state.level / 5));
        document.getElementById('rankName').innerText = ranks[rankIdx];
        document.getElementById('rankIcon').innerText = ['🥉', '🥈', '🥇', '👑', '🌌'][rankIdx];

        const nextLevelXp = this.state.level * 1000;
        document.getElementById('rankProgress').style.width = (this.state.xp / nextLevelXp) * 100 + '%';

        document.getElementById('gameOverScreen').style.display = 'flex';

        if (this.canRevive) {
            document.getElementById('reviveBtn').style.display = 'flex';
        } else {
            document.getElementById('reviveBtn').style.display = 'none';
        }

        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStop();
            window.CrazyGames.SDK.ad.requestAd('midgame', {
                adStarted: () => { if(window.audioManager) window.audioManager.mute(); },
                adFinished: () => { if(window.audioManager) window.audioManager.unmute(); },
                adError: () => { if(window.audioManager) window.audioManager.unmute(); }
            });
        }
    }

    reviveWithAd() {
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
            window.CrazyGames.SDK.ad.requestAd('rewarded', {
                adStarted: () => { if(window.audioManager) window.audioManager.mute(); },
                adFinished: () => {
                    if(window.audioManager) window.audioManager.unmute();
                    this.revive();
                },
                adError: () => {
                    if(window.audioManager) window.audioManager.unmute();
                    alert("Ad failed to load. Please try again later.");
                }
            });
        } else {
            // Fallback for dev environment
            this.revive();
        }
    }

    revive() {
        this.gameState = 'PLAYING';
        this.canRevive = false;
        this.craft.y = this.canvas.height / 2;
        this.craft.velocity = 0;
        this.pillars = this.pillars.filter(p => p.x > this.craft.x + 100 || p.x < this.craft.x - 100);
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('reviveBtn').style.display = 'none';
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStart();
        }
    }

    showMenu() {
        console.log("Showing Menu");
        this.gameState = 'START';
        document.getElementById('pauseMenuOverlay').classList.remove('active');
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('mainMenu').style.opacity = '1';
        document.getElementById('topNavBar').style.display = 'flex';
        this.refreshLobby();
    }

    updateUI() {
        document.getElementById('scoreValue').innerText = this.score;
        document.getElementById('comboValue').innerText = 'x' + this.combo;
        document.getElementById('coinsValue').innerText = this.coinsInRun;
    }

    loop(timestamp) {
        let dt = (timestamp - this.lastTime) / 16.67;
        this.lastTime = timestamp;
        if (dt > 5) dt = 1;

        if (this.hitStop > 0) {
            this.hitStop -= dt;
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        if (this.gameState === 'PLAYING') {
            this.update(dt);
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        let speedMult = this.activePowerups['slowmo'] > 0 ? 0.5 : 1.0;
        let effectiveDt = dt * speedMult;

        this.craft.update(effectiveDt);

        this.stars.forEach((layer, i) => {
            let speed = (3 - i) * 0.4;
            layer.forEach(s => {
                s.x -= speed * effectiveDt;
                if (s.x < 0) s.x = this.canvas.width;
            });
        });

        // Pillars
        if (this.pillars.length === 0 || this.pillars[this.pillars.length - 1].x < this.canvas.width - 260) {
            let newPillar = new Pillar(this.canvas, this.canvas.width, this.selectedChar.color);
            this.pillars.push(newPillar);
            this.coins.push(new Coin(this.canvas, this.canvas.width + 100, newPillar.top + newPillar.gap / 2));
            if (Math.random() < 0.15) {
                let types = ['shield', 'magnet', 'slowmo'];
                this.powerups.push(new PowerUp(this.canvas, this.canvas.width + 150, Math.random() * (this.canvas.height - 100) + 50, types[Math.floor(Math.random() * types.length)]));
            }
        }

        for (let i = this.pillars.length - 1; i >= 0; i--) {
            let p = this.pillars[i];
            p.update(effectiveDt, this.gameSpeed);
            // Fair hitboxes: visual is radius 15, we use 10 for collision
            if (this.craft.x + 10 > p.x && this.craft.x - 10 < p.x + p.width) {
                if (this.craft.y - 8 < p.top || this.craft.y + 8 > this.canvas.height - p.bottom) {
                    this.gameOver();
                }
            }
            if (!p.passed && p.x + p.width < this.craft.x) {
                p.passed = true;
                this.score += this.combo;
                this.combo++;
                this.flash = 6;
                this.updateUI();
                if (window.audioManager) window.audioManager.playSound('score');
            }
            if (p.x + p.width < -100) this.pillars.splice(i, 1);
        }

        // Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            let c = this.coins[i];
            c.update(effectiveDt, this.gameSpeed, this.craft);
            let dx = this.craft.x - c.x;
            let dy = this.craft.y - c.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.craft.radius + c.radius) {
                this.coinsInRun++;
                this.updateUI();
                this.floaters.push(new ScoreFloater(c.x, c.y, '+1', '#ffd700'));
                if (window.audioManager) window.audioManager.playSound('score');

                // Particle burst for coins
                for(let j=0; j<8; j++) {
                    this.craft.particles.push({
                        x: c.x, y: c.y,
                        vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                        life: 1.0, size: Math.random()*4+2
                    });
                }

                this.coins.splice(i, 1);
                continue;
            }
            if (c.x < -50) this.coins.splice(i, 1);
        }

        // Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            let pu = this.powerups[i];
            pu.update(effectiveDt, this.gameSpeed);
            let dx = this.craft.x - pu.x;
            let dy = this.craft.y - pu.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.craft.radius + pu.radius) {
                this.applyPowerup(pu.type);
                this.floaters.push(new ScoreFloater(pu.x, pu.y, pu.type.toUpperCase(), '#fff'));

                // Track powerup usage for quests
                const quest = this.state.dailyQuests.find(q => q.id === 3);
                if (quest && !quest.done) quest.progress++;

                this.powerups.splice(i, 1);
                continue;
            }
            if (pu.x < -50) this.powerups.splice(i, 1);
        }

        // Powerup timers
        for (let type in this.activePowerups) {
            if (this.activePowerups[type] > 0) {
                this.activePowerups[type] -= effectiveDt;
                if (this.activePowerups[type] <= 0) {
                    if (type === 'shield') this.craft.shielded = false;
                    if (type === 'magnet') this.craft.magnetized = false;
                }
            }
        }

        // Floaters
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            this.floaters[i].update(dt);
            if (this.floaters[i].life <= 0) this.floaters.splice(i, 1);
        }

        if (this.craft.y + this.craft.radius > this.canvas.height || this.craft.y - this.craft.radius < 0) {
            this.gameOver();
        }

        if (this.shake > 0) this.shake -= dt;
        if (this.flash > 0) this.flash -= dt;
    }

    applyPowerup(type) {
        if (window.audioManager) window.audioManager.playSound('score');
        const upgradeLevel = this.state.upgrades[type] || 1;
        this.activePowerups[type] = 300 + (upgradeLevel * 60); // Base 5s + 1s per level
        if (type === 'shield') this.craft.shielded = true;
        if (type === 'magnet') this.craft.magnetized = true;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }

        ctx.fillStyle = '#fff';
        this.stars.forEach((layer, i) => {
            ctx.globalAlpha = (3 - i) * 0.25;
            layer.forEach(s => {
                ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
            });
        });
        ctx.globalAlpha = 1.0;

        this.pillars.forEach(p => p.draw());
        this.coins.forEach(c => c.draw());
        this.powerups.forEach(pu => pu.draw());
        this.craft.draw();
        this.floaters.forEach(f => f.draw(ctx));

        if (this.flash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flash * 0.08})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.restore();
    }
}

window.onload = () => {
    window.game = new Game();
};
