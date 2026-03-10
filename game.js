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

        // Shield Effect
        if (this.shielded) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 25 + Math.sin(this.pulse * 2) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#fff';
        }

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

        this.characters = [
            { id: 'swift', name: 'Swift-X', color: '#00f2ff', emoji: '🚀' },
            { id: 'neon', name: 'Neon-Volt', color: '#ff00ff', emoji: '⚡' },
            { id: 'emerald', name: 'Emerald-Jet', color: '#00ff88', emoji: '💎' },
            { id: 'gold', name: 'Midas-1', color: '#ffcc00', emoji: '🏆' }
        ];
        this.selectedChar = this.characters[0];

        this.craft = new AeroCraft(this.canvas, this.selectedChar.color);
        this.pillars = [];
        this.coins = [];
        this.powerups = [];
        this.floaters = [];
        this.stars = this.initStars();

        this.score = 0;
        this.combo = 1;
        this.totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameState = 'START';
        this.lastTime = 0;
        this.shake = 0;
        this.hitStop = 0;
        this.flash = 0;
        this.gameSpeed = 4.5;
        this.activePowerups = {};

        this.initUI();
        this.initInput();
        requestAnimationFrame((t) => this.loop(t));

        setTimeout(() => {
            document.getElementById('startingAnimation').style.display = 'none';
        }, 3000);
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
        const charSelect = document.getElementById('characterSelect');
        charSelect.innerHTML = '';
        this.characters.forEach(char => {
            const div = document.createElement('div');
            div.className = `character-option ${char.id === this.selectedChar.id ? 'selected' : ''}`;
            div.innerHTML = `<div style="font-size: 24px">${char.emoji}</div><div>${char.name}</div>`;
            div.onclick = () => {
                this.selectedChar = char;
                this.craft.themeColor = char.color;
                document.querySelectorAll('.character-option').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');
                document.querySelector('.bird-logo').innerText = char.emoji;
                if (window.audioManager) window.audioManager.playSound('score');
            };
            charSelect.appendChild(div);
        });
        document.getElementById('highScoreValue').innerText = this.highScore;
        document.getElementById('gameOverHighScore').innerText = this.highScore;
        document.getElementById('coinsValue').innerText = this.totalCoins;
    }

    initInput() {
        const handleInput = (e) => {
            if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) return;
            if (this.gameState === 'PLAYING') {
                this.craft.velocity = this.craft.jump;
                if (window.audioManager) window.audioManager.playSound('flap');
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
        });
        this.canvas.addEventListener('mousedown', handleInput);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput();
        }, { passive: false });

        document.getElementById('playGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());

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
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>3. YOU</span> <span>${this.highScore}</span></div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;"><span>4. StarDash</span> <span>4,200</span></div>
                `;
            }, 500);
        });

        // Achievement logic
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            const entries = document.getElementById('achievementsEntries');
            const list = [
                { n: 'First Flight', d: 'Start your first run', c: true },
                { n: 'Coin Collector', d: 'Gather 100 coins total', c: this.totalCoins >= 100 },
                { n: 'Ace Pilot', d: 'Reach a score of 50', c: this.highScore >= 50 },
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
        this.gameState = 'PLAYING';
        this.score = 0;
        this.combo = 1;
        this.pillars = [];
        this.coins = [];
        this.powerups = [];
        this.floaters = [];
        this.activePowerups = {};
        this.gameSpeed = 4.5;
        this.craft.reset();
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameUI').style.opacity = '1';
        this.updateUI();
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

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.getElementById('highScoreValue').innerText = this.highScore;
        }
        localStorage.setItem('totalCoins', this.totalCoins);

        document.getElementById('finalScore').innerText = this.score;
        document.getElementById('gameOverHighScore').innerText = this.highScore;
        document.getElementById('coinsCollected').innerText = this.totalCoins;

        let ranks = [
            { s: 0, n: 'Rookie', e: '🥉' },
            { s: 10, n: 'Pilot', e: '🥈' },
            { s: 30, n: 'Ace', e: '🥇' },
            { s: 60, n: 'Legend', e: '👑' },
            { s: 100, n: 'Sky God', e: '🌌' }
        ];
        let currentRank = ranks[0];
        for (let r of ranks) { if (this.score >= r.s) currentRank = r; }
        document.getElementById('rankName').innerText = currentRank.n;
        document.getElementById('rankIcon').innerText = currentRank.e;
        document.getElementById('rankProgress').style.width = Math.min(100, (this.score / 100) * 100) + '%';

        document.getElementById('gameOverScreen').style.display = 'flex';

        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStop();
            window.CrazyGames.SDK.ad.requestAd('midgame', {
                adStarted: () => { if(window.audioManager) window.audioManager.mute(); },
                adFinished: () => { if(window.audioManager) window.audioManager.unmute(); },
                adError: () => { if(window.audioManager) window.audioManager.unmute(); }
            });
        }
    }

    showMenu() {
        this.gameState = 'START';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('gameUI').style.opacity = '0';
    }

    updateUI() {
        document.getElementById('scoreValue').innerText = this.score;
        document.getElementById('comboValue').innerText = 'x' + this.combo;
        document.getElementById('coinsValue').innerText = this.totalCoins;
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
            if (this.craft.x + 12 > p.x && this.craft.x - 12 < p.x + p.width) {
                if (this.craft.y - 10 < p.top || this.craft.y + 10 > this.canvas.height - p.bottom) {
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
                this.totalCoins++;
                this.updateUI();
                this.floaters.push(new ScoreFloater(c.x, c.y, '+1', '#ffd700'));
                if (window.audioManager) window.audioManager.playSound('score');
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
        this.activePowerups[type] = 300;
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
