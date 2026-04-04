/**
 * Aero Dash: Sky High - Ultimate Professional Edition
 * Optimized for CrazyGames with high-fidelity juice and depth.
 */

class AeroCraft {
    constructor(canvas, themeColor, id = 'swift') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.themeColor = themeColor || '#00f2ff';
        this.id = id;
        this.particles = [];
        this.particlePool = []; // Optimization: Pool for particles
        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 4;
        this.targetX = this.canvas.width / 4;
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.gravity = 0.6;
        this.jump = -6; // Ultra-easy floaty control
        this.radius = 15;
        this.rotation = 0;

        // Return existing particles to pool
        while(this.particles.length > 0) {
            this.particlePool.push(this.particles.pop());
        }

        this.pulse = 0;
        this.shielded = false;
        this.magnetized = false;
        this.phasing = false;
        this.phaseCooldown = 0;
        this.invulnerable = 0;
        this.ultimateEnergy = 0;
        this.ultimateMax = 100;
        this.ultimateActive = false;
        this.ultimateTimer = 0;
        this.projectiles = [];
        this.shootTimer = 0;
    }

    update(dt) {
        if (window.game && window.game.boss) {
            this.shootTimer -= dt * 16.67;
            if (this.shootTimer <= 0) {
                this.projectiles.push({ x: this.x + 20, y: this.y, vx: 12, life: 1.0 });
                this.shootTimer = 400; // Fast auto-firing
                if (window.audioManager) window.audioManager.playSound('thrust');
            }
        }

        // Projectile physics and collision
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dt;
            if (window.game && window.game.boss) {
                let dx = p.x - window.game.boss.x;
                let dy = p.y - window.game.boss.y;
                if (Math.abs(dx) < 60 && Math.abs(dy) < 60) {
                    window.game.boss.health -= 5;
                    window.game.shake = 5;
                    window.game.spawnFloater(p.x, p.y, 'HIT!', '#ff0000');
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }
            if (p.x > this.canvas.width) this.projectiles.splice(i, 1);
        }

        if (this.ultimateTimer > 0) {
            this.ultimateTimer -= dt * 16.67;
            if (this.ultimateTimer <= 0) {
                this.ultimateActive = false;
                this.phasing = false;
                this.invulnerable = 1000;
            }
        } else if (window.game && window.game.gameState === 'PLAYING') {
            this.ultimateEnergy = Math.min(this.ultimateMax, this.ultimateEnergy + 0.1 * dt);
        }

        if (this.phaseCooldown > 0) this.phaseCooldown -= dt * 16.67;
        if (this.invulnerable > 0) this.invulnerable -= dt * 16.67;

        // X-Position smoothing for speed lean
        this.x += (this.targetX - this.x) * 0.1 * dt;

        // Boundary push-back logic - Keeps player on screen during phase/mutators
        if (this.y < 30) {
            this.velocity += 1.5 * dt; // Push down
        } else if (this.y > this.canvas.height - 30) {
            this.velocity -= 1.5 * dt; // Push up
        }

        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));

        // Trail particles
        let trailChance = this.phasing ? 0.9 : 0.4;
        if (this.particles.length > 60) trailChance *= 0.5; // Throttle if too many
        if (Math.random() > (1 - trailChance)) {
            let trailId = 'basic';
            if (window.game && window.game.state) trailId = window.game.state.selectedTrail;

            let tColor = this.phasing ? '#00ffff' : this.themeColor;

            if (!this.phasing) {
                if (trailId === 'rainbow') tColor = `hsl(${window.game.score * 10 % 360}, 100%, 50%)`;
                else if (trailId === 'matrix') tColor = '#00ff41';
                else if (trailId === 'fire') tColor = '#ff4b2b';
            }

            // Object Pooling Logic
            let p = this.particlePool.pop() || {};
            p.x = this.x - 10;
            p.y = this.y;
            p.vx = (this.phasing ? -8 : -2) - Math.random() * 2;
            p.vy = (Math.random() - 0.5) * 2;
            p.life = 1.0;
            p.size = (this.phasing ? 8 : 5) + Math.random() * 2;
            p.color = tColor;
            this.particles.push(p);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 0.04 * dt;
            if (p.life <= 0) {
                this.particlePool.push(this.particles.splice(i, 1)[0]);
            }
        }

        this.pulse += 0.1 * dt;
    }

    draw() {
        const ctx = this.ctx;
        ctx.save(); // Wrapper save for leaked translations/filters

        if (this.phasing) {
            ctx.filter = 'hue-rotate(90deg) contrast(1.5) brightness(1.2)';
            if (Math.random() > 0.7) {
                ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
            }
        }

        // Shield / Invulnerable Effect
        if (this.shielded || this.invulnerable > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.strokeStyle = this.invulnerable > 0 ? '#00ffff' : '#fff';
            ctx.lineWidth = this.invulnerable > 0 ? 2 : 3;
            if (this.invulnerable > 0) ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, 25 + Math.sin(this.pulse * 2) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Particles
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            ctx.globalAlpha = p.life * 0.7;
            ctx.fillStyle = p.color || this.themeColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Advanced Glow
        ctx.shadowBlur = 20 + Math.sin(this.pulse) * 8;
        ctx.shadowColor = this.themeColor;

        // --- POLISHED VIPER-X MODEL ---

        // Thruster Flame
        const thrusterSize = 5 + Math.abs(this.velocity);
        ctx.fillStyle = this.phasing ? '#00ffff' : '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-10 - thrusterSize * 2, -2);
        ctx.lineTo(-10 - thrusterSize * 2.5, 0);
        ctx.lineTo(-10 - thrusterSize * 2, 2);
        ctx.fill();

        // Engine Nozzles
        ctx.fillStyle = '#333';
        ctx.fillRect(-12, -4, 4, 8);

        // Main Wing Structure
        let grad = ctx.createLinearGradient(-15, 0, 20, 0);
        grad.addColorStop(0, '#111');
        grad.addColorStop(0.5, this.themeColor);
        grad.addColorStop(1, '#fff');
        ctx.fillStyle = grad;

        // Sleek fuselage
        ctx.beginPath();
        const charId = this.id;
        if (charId === 'glitch') {
            // Blocky glitchy shape
            ctx.rect(-10, -10, 20, 20);
            ctx.rect(10, -5, 10, 10);
        } else if (charId === 'phantom') {
            // Pointy ghost shape
            ctx.moveTo(25, 0); ctx.lineTo(-10, -15); ctx.lineTo(-5, 0); ctx.lineTo(-10, 15);
        } else {
            ctx.moveTo(22, 0);       // Nose
            ctx.lineTo(-8, -14);     // Top wing tip
            ctx.lineTo(-12, -10);    // Back top
            ctx.lineTo(-5, 0);       // Center back
            ctx.lineTo(-12, 10);     // Back bottom
            ctx.lineTo(-8, 14);      // Bottom wing tip
        }
        ctx.closePath();
        ctx.fill();

        // Mechanical Hull Plating Detail
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.lineTo(10, 0); ctx.lineTo(0, 8);
        ctx.stroke();

        // Cockpit (Glass)
        let cockpitGrad = ctx.createRadialGradient(8, -2, 1, 8, -2, 6);
        cockpitGrad.addColorStop(0, '#00ffff');
        cockpitGrad.addColorStop(1, '#002233');
        ctx.fillStyle = cockpitGrad;
        ctx.beginPath();
        ctx.ellipse(8, 0, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();

        // Eye glow / Scanner
        ctx.fillStyle = this.phasing ? '#00ffff' : '#ff0000';
        ctx.beginPath();
        ctx.arc(15, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // Restore craft specific translate/rotate

        // Draw Player Projectiles
        for (let i = 0; i < this.projectiles.length; i++) {
            let p = this.projectiles[i];
            ctx.fillStyle = '#00f2fe';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f2fe';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore(); // Restore wrapper save
        ctx.shadowBlur = 0;
        ctx.filter = 'none';
    }

    phase() {
        if (this.phaseCooldown > 0 || this.ultimateActive) return false;
        this.phasing = true;
        this.phaseCooldown = 4000; // 4s cooldown

        setTimeout(() => {
            if (!this.ultimateActive) this.phasing = false;
            this.invulnerable = 500; // 0.5s grace period
        }, 600); // 0.6s phase duration
        return true;
    }

    useUltimate() {
        if (this.ultimateEnergy < this.ultimateMax || this.ultimateActive) return false;
        this.ultimateEnergy = 0;
        this.ultimateActive = true;

        const id = this.id;
        if (id === 'swift') {
            this.ultimateTimer = 3000;
            this.velocity = this.jump * 2;
        } else if (id === 'neon') {
            this.ultimateTimer = 5000;
        } else if (id === 'emerald') {
            this.ultimateTimer = 8000;
            this.shielded = true;
        } else if (id === 'gold') {
            this.ultimateTimer = 6000;
        } else if (id === 'phantom') {
            this.ultimateTimer = 5000;
            this.phasing = true;
        } else if (id === 'solar') {
            this.ultimateTimer = 1000;
            if (window.game) window.game.clearObstacles();
        } else if (id === 'void') {
            this.ultimateTimer = 4000;
            this.magnetized = true;
        } else if (id === 'glitch') {
            this.ultimateTimer = 2000;
            if (window.game) window.game.triggerMutator();
        }

        if (window.game) {
            window.game.shake = 20;
            window.game.flash = 15;
            window.game.spawnFloater(this.x, this.y - 40, "ULTIMATE: " + id.toUpperCase(), "#ff00ff");
            if (window.audioManager) window.audioManager.playSound('score');
        }
        return true;
    }
}

class Pillar {
    constructor(canvas, x, themeColor, gap = 170) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.width = 65;
        this.gap = gap;
        let availableSpace = Math.max(100, canvas.height - this.gap - 120);
        this.top = Math.random() * availableSpace + 60;
        this.bottom = canvas.height - (this.top + this.gap);
        this.passed = false;
        this.color = themeColor;
        this.anim = 0;
        // 20% chance to be a Laser Gate
        this.isLaser = Math.random() < 0.2;
    }

    update(dt, speed) {
        this.x -= speed * dt;
        this.anim += 0.05 * dt;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        if (this.isLaser) {
            this.drawLaserGate(ctx);
            return;
        }

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

    drawLaserGate(ctx) {
        ctx.save();
        // Posts
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, 0, this.width, this.top);
        ctx.fillRect(this.x, this.canvas.height - this.bottom, this.width, this.bottom);

        // Laser effect
        const laserAlpha = 0.3 + Math.abs(Math.sin(this.anim * 2)) * 0.4;
        ctx.globalAlpha = laserAlpha;
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';

        // Horizontal laser lines
        ctx.fillRect(this.x - 5, this.top - 5, this.width + 10, 5);
        ctx.fillRect(this.x - 5, this.canvas.height - this.bottom, this.width + 10, 5);

        // Vertical connecting beams
        ctx.fillRect(this.x + 10, this.top, 2, this.gap);
        ctx.fillRect(this.x + this.width - 12, this.top, 2, this.gap);

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

class CrushingPiston {
    constructor(canvas, x, color) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.width = 80;
        this.gap = 180;
        this.color = color;
        this.timer = 0;
        this.state = 'IDLE'; // IDLE, CRUSH, RETRACT
        this.crushY = 0;
        this.passed = false;
    }
    update(dt, speed) {
        this.x -= speed * dt;
        this.timer += 0.05 * dt;

        // Piston oscillation
        this.crushY = Math.abs(Math.sin(this.timer)) * (this.canvas.height / 2 - 50);
    }
    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#444';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        // Top block
        ctx.fillRect(this.x, 0, this.width, this.crushY);
        // Bottom block
        ctx.fillRect(this.x, this.canvas.height - this.crushY, this.width, this.crushY);

        // Hazards
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.crushY - 10, this.width, 10);
        ctx.fillRect(this.x, this.canvas.height - this.crushY, this.width, 10);

        ctx.restore();
    }
}

class OscillatingLaser {
    constructor(canvas, x, color) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = canvas.height / 2;
        this.width = 40;
        this.color = color;
        this.timer = 0;
        this.passed = false;
    }
    update(dt, speed) {
        this.x -= speed * dt;
        this.timer += 0.03 * dt;
        this.y = (this.canvas.height / 2) + Math.sin(this.timer) * (this.canvas.height / 3);
    }
    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Laser Core
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, this.y - 40);
        ctx.moveTo(this.x, this.y + 40);
        ctx.lineTo(this.x, this.canvas.height);
        ctx.stroke();

        // Nodes
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 10, this.y - 50, 20, 20);
        ctx.fillRect(this.x - 10, this.y + 30, 20, 20);

        ctx.restore();
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
        ctx.filter = 'none';
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

class BossHyperGuardian {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width + 300;
        this.y = canvas.height / 2;
        this.health = 150;
        this.maxHealth = 150;
        this.projectiles = [];
        this.shootTimer = 0;
        this.targetY = canvas.height / 2;
        this.rotation = 0;
        this.pulse = 0;
    }
    update(dt, playerY) {
        this.rotation += 0.05 * dt;
        this.pulse += 0.1 * dt;

        // Entry logic
        if (this.x > this.canvas.width - 280) {
            this.x -= 4 * dt;
        }

        // Aggressive hover
        this.targetY = playerY;
        this.y += (this.targetY - this.y) * 0.08 * dt;

        this.shootTimer -= dt * 16.67;

        if (this.shootTimer <= 0) {
            // Rapid spread shot
            for(let i=0; i<3; i++) {
                this.projectiles.push({
                    x: this.x - 40,
                    y: this.y,
                    vx: -10 - Math.random() * 5,
                    vy: (i - 1) * 3 + (Math.random() - 0.5) * 2,
                    size: 10
                });
            }
            this.shootTimer = 1200;
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < -20) this.projectiles.splice(i, 1);
        }
    }
    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Outer rotating shield shards
        ctx.strokeStyle = '#ff0044';
        ctx.lineWidth = 4;
        for(let i=0; i<4; i++) {
            ctx.save();
            ctx.rotate(this.rotation + (i * Math.PI / 2));
            ctx.strokeRect(80, -20, 10, 40);
            ctx.restore();
        }

        // Menacing Body
        let grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
        grad.addColorStop(0, '#ff00ff');
        grad.addColorStop(1, '#220022');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 40 + Math.sin(this.pulse) * 20;
        ctx.shadowColor = '#ff00ff';

        ctx.beginPath();
        for(let i=0; i<8; i++) {
            let r = 60 + Math.sin(this.pulse + i) * 10;
            let ang = i * Math.PI / 4;
            ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fill();

        // Multiple Eyes
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 10;
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(-30, (i-1) * 25, 8 + Math.sin(this.pulse)*2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 15 + Math.sin(this.pulse * 2) * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Projectiles
        for (let i = 0; i < this.projectiles.length; i++) {
            let p = this.projectiles[i];
            ctx.fillStyle = '#ff0044';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0044';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size || 8, 0, Math.PI * 2);
            ctx.fill();
            // Core of projectile
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.size || 8) / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class EnemyDrone {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.startY = y;
        this.radius = 12;
        this.angle = 0;
        this.speed = 2;
    }
    update(dt, gameSpeed) {
        this.x -= gameSpeed * dt;
        this.angle += 0.05 * dt;
        this.y = this.startY + Math.sin(this.angle) * 50;
    }
    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Drone Body
        ctx.fillStyle = '#ff0044';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0044';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Rotors
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.rotate(this.angle * 2);
        ctx.beginPath();
        ctx.moveTo(-18, 0); ctx.lineTo(18, 0);
        ctx.moveTo(0, -18); ctx.lineTo(0, 18);
        ctx.stroke();

        ctx.restore();
    }
}

class ScoreFloater {
    constructor() {
        this.reset(0, 0, "", "#fff");
    }
    reset(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color || '#fff';
        this.life = 1.0;
        this.active = true;
    }
    update(dt) {
        this.y -= 2 * dt;
        this.life -= 0.02 * dt;
        if (this.life <= 0) this.active = false;
    }
    draw(ctx) {
        if (!this.active) return;
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

        // Cache UI elements
        this.ui = {
            score: document.getElementById('scoreValue'),
            boss: document.getElementById('bossHealthUI'),
            bossFill: document.getElementById('bossHealthFill'),
            dashFill: document.getElementById('dashCooldownFill'),
            ultFill: document.getElementById('ultimateEnergyFill'),
            progFill: document.getElementById('zoneProgressFill'),
            progText: document.getElementById('zoneProgressText'),
            comboMeter: document.getElementById('comboMeter'),
            comboVal: document.getElementById('comboValue'),
            coinsVal: document.getElementById('coinsValue'),
            difficulty: document.getElementById('difficultyIndicator')
        };
        this.lastUiValues = {};

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // --- ECOSYSTEM STATE ---
        const defaultState = {
            coins: 0,
            gems: 0,
            level: 1,
            xp: 0,
            highScore: 0,
            unlockedCrafts: ['swift'],
            selectedCraft: 'swift',
            unlockedTrails: ['basic'],
            selectedTrail: 'basic',
            upgrades: {
                shield: 1,
                magnet: 1,
                slowmo: 1,
                luck: 1
            },
            stats: {
                totalTime: 0,
                totalDist: 0,
                totalCoins: 0,
                maxCombo: 0
            },
            lastLogin: Date.now(),
            loginStreak: 0,
            tutorialSeen: false,
            dailyQuests: this.generateQuests()
        };

        const savedState = JSON.parse(localStorage.getItem('aeroDashState'));
        this.state = savedState ? { ...defaultState, ...savedState, upgrades: { ...defaultState.upgrades, ...(savedState.upgrades || {}) } } : defaultState;

        // Daily Logic (Quests & Login Streak)
        const lastDate = new Date(this.state.lastLogin).toDateString();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toDateString();
        const todayDate = new Date().toDateString();

        if (lastDate !== todayDate || (this.state.loginStreak === 0 && !this.state.tutorialSeen)) {
            if (lastDate === yesterdayDate) {
                this.state.loginStreak = (this.state.loginStreak % 7) + 1;
            } else if (lastDate !== todayDate) {
                this.state.loginStreak = 1;
            }
            if (this.state.loginStreak === 0) this.state.loginStreak = 1;

            this.state.dailyQuests = this.generateQuests();
            this.state.lastLogin = Date.now();
            this.showDailyReward();
        }

        this.characters = [
            { id: 'swift', name: 'Swift-X', color: '#00f2fe', emoji: '🚀', price: 0 },
            { id: 'neon', name: 'Neon-Volt', color: '#ff00ff', emoji: '⚡', price: 500 },
            { id: 'emerald', name: 'Emerald-Jet', color: '#00ff88', emoji: '💎', price: 1200 },
            { id: 'gold', name: 'Midas-1', color: '#ffcc00', emoji: '🏆', price: 3000 },
            { id: 'phantom', name: 'Phantom-S', color: '#ffffff', emoji: '👻', price: 5000 },
            { id: 'solar', name: 'Solar-Flare', color: '#ff8c00', emoji: '☀️', price: 8000 },
            { id: 'void', name: 'Void-Star', color: '#9d00ff', emoji: '🌌', price: 15000 },
            { id: 'glitch', name: 'Glitch-Zero', color: '#00ff41', emoji: '👾', price: 25000 }
        ];

        this.selectedChar = this.characters.find(c => c.id === this.state.selectedCraft) || this.characters[0];

        this.trails = [
            { id: 'basic', name: 'Standard Plasma', color: this.selectedChar.color, price: 0 },
            { id: 'rainbow', name: 'Rainbow Pulse', color: 'RAINBOW', price: 500 },
            { id: 'matrix', name: 'Digital Rain', color: '#00ff41', price: 1000 },
            { id: 'fire', name: 'Hellfire', color: '#ff4b2b', price: 1500 }
        ];

        this.zones = [
            { id: 'neon', name: 'NEON CITY', color: '#00f2fe', gravity: 0.35, speed: 2.5 },
            { id: 'void', name: 'DARK VOID', color: '#9d00ff', gravity: 0.45, speed: 3.5 },
            { id: 'inferno', name: 'INFERNO', color: '#ff4b2b', gravity: 0.25, speed: 5.0 }
        ];
        this.currentZoneIdx = 0;

        this.craft = new AeroCraft(this.canvas, this.selectedChar.color, this.selectedChar.id);
        this.pillars = [];
        this.coins = [];
        this.powerups = [];
        this.drones = [];
        this.floaters = [];
        this.floaterPool = [];
        this.stars = this.initStars();
        this.buildings = this.initBuildings();

        this.pistons = [];
        this.lasers = [];

        this.score = 0;
        this.combo = 1;
        this.gameMode = 'endless';
        this.isReady = false;
        this.timeLeft = 60;
        this.warpMode = false;
        this.warpTimer = 0;
        this.pointsToWarp = 30;
        this.mutator = null;
        this.mutatorTimer = 0;
        this.pointsToMutate = 25;
        this.lastZoneScore = 0;
        this.boss = null;
        this.pointsToBoss = 100;
        this.gameState = 'START';
        this.lastTime = 0;
        this.shake = 0;
        this.hitStop = 0;
        this.flash = 0;
        this.activePowerups = {};
        this.runHistory = [];
        this.bestRun = JSON.parse(localStorage.getItem('aeroDashBestRun')) || [];

        this.initUI();
        this.initInput();
        this.showMenu();
        requestAnimationFrame((t) => this.loop(t));

        const splash = document.getElementById('startingAnimation');
        if (splash) {
            splash.onclick = () => {
                splash.style.display = 'none';
                this.checkTutorial();
                this.isReady = true;
            };
            setTimeout(() => {
                splash.style.display = 'none';
                this.checkTutorial();
                this.isReady = true;
            }, 3000);
        } else {
            this.checkTutorial();
            this.isReady = true;
        }
    }

    checkTutorial() {
        if (!this.state.tutorialSeen) {
            document.getElementById('tutorialOverlay').classList.add('active');
            document.getElementById('startTutorialBtn').onclick = () => {
                this.state.tutorialSeen = true;
                document.getElementById('tutorialOverlay').classList.remove('active');
                this.saveState();
            };
        }
    }

    saveState() {
        localStorage.setItem('aeroDashState', JSON.stringify(this.state));
    }

    showDailyReward() {
        const streak = this.state.loginStreak || 1;
        const rewards = [200, 500, 1000, 2000, 5000, 10000, 25000];
        const reward = rewards[streak - 1];

        document.getElementById('rewardDayText').innerText = `Day ${streak} of 7`;
        document.getElementById('rewardValue').innerText = `💰 ${reward}`;
        document.getElementById('dailyRewardOverlay').classList.add('active');

        document.getElementById('claimRewardBtn').onclick = () => {
            this.state.coins += reward;
            document.getElementById('dailyRewardOverlay').classList.remove('active');
            this.refreshLobby();
            if (window.audioManager) window.audioManager.playSound('score');
            this.saveState();
        };
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
        this.canvas.width = container.clientWidth || 1280;
        this.canvas.height = container.clientHeight || 720;
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

    initBuildings() {
        let layers = [[], []];
        // Distant silhouettes
        for (let i = 0; i < 15; i++) {
            layers[0].push({
                x: Math.random() * this.canvas.width,
                w: 60 + Math.random() * 100,
                h: 200 + Math.random() * 300,
                color: 'rgba(20, 20, 40, 0.4)'
            });
            // Mid-ground structures
            layers[1].push({
                x: Math.random() * this.canvas.width,
                w: 40 + Math.random() * 80,
                h: 100 + Math.random() * 200,
                color: 'rgba(30, 30, 60, 0.6)'
            });
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

        // Mode Logic
        document.querySelectorAll('.mode-option').forEach(opt => {
            opt.onclick = () => {
                document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.gameMode = opt.dataset.mode;
                if (window.audioManager) window.audioManager.playSound('thrust');
            };
        });

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
                    this.craft.id = char.id;
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
            { id: 'slowmo', name: 'Slow-Mo Time', icon: '⏱️' },
            { id: 'luck', name: 'Luck Boost', icon: '🍀' }
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

        const trailGrid = document.getElementById('trailShopGrid');
        trailGrid.innerHTML = '';
        this.trails.forEach(t => {
            const isUnlocked = this.state.unlockedTrails.includes(t.id);
            const isSelected = this.state.selectedTrail === t.id;
            const item = document.createElement('div');
            item.className = `shop-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
            item.innerHTML = `
                <div class="item-visual">✨</div>
                <div class="item-name">${t.name}</div>
                <div class="item-price">${isUnlocked ? (isSelected ? 'EQUIPPED' : 'OWNED') : '💰 ' + t.price}</div>
            `;
            item.onclick = () => {
                if (isUnlocked) {
                    this.state.selectedTrail = t.id;
                } else if (this.state.coins >= t.price) {
                    this.state.coins -= t.price;
                    this.state.unlockedTrails.push(t.id);
                    if (window.audioManager) window.audioManager.playSound('score');
                }
                this.refreshLobby();
                this.renderShop();
            };
            trailGrid.appendChild(item);
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
            if (e.code === 'KeyShift' || e.code === 'KeyF' || e.code === 'KeyE') {
                if (this.gameState === 'PLAYING' && this.craft.phase()) {
                    this.shake = 10;
                    if (window.audioManager) window.audioManager.playSound('thrust');
                }
            }
            if (e.code === 'KeyQ' || e.code === 'KeyR') {
                if (this.gameState === 'PLAYING') this.craft.useUltimate();
            }
            if (e.code === 'Escape' && this.gameState === 'PLAYING') this.pauseGame();
        });
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click to dash
                if (this.gameState === 'PLAYING' && this.craft.phase()) {
                    this.shake = 10;
                    if (window.audioManager) window.audioManager.playSound('thrust');
                }
            } else {
                handleInput();
            }
        });
        this.canvas.oncontextmenu = (e) => e.preventDefault();
        let lastTap = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const now = Date.now();
            const TIMESPAN = 300;
            if (now - lastTap < TIMESPAN) {
                // Double tap
                if (this.gameState === 'PLAYING' && this.craft.phase()) {
                    this.shake = 10;
                    if (window.audioManager) window.audioManager.playSound('thrust');
                }
            } else {
                handleInput();
            }
            lastTap = now;
        }, { passive: false });

        document.getElementById('playGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('pauseBtnInGame').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('reviveBtn').addEventListener('click', () => this.reviveWithAd());
        document.getElementById('doubleRewardBtn').addEventListener('click', () => this.doubleRewardsWithAd());
        document.getElementById('dailyAdBtn').addEventListener('click', () => this.claimDailyGiftWithAd());

        // Monetization Buttons
        document.querySelectorAll('.coin-pill .add-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
                    window.CrazyGames.SDK.ad.requestAd('rewarded', {
                        adStarted: () => { if (window.audioManager) window.audioManager.mute(); },
                        adFinished: () => {
                            if (window.audioManager) window.audioManager.unmute();
                            this.state.coins += 500;
                            this.refreshLobby();
                            if (window.audioManager) window.audioManager.playSound('score');
                        },
                        adError: () => { if (window.audioManager) window.audioManager.unmute(); }
                    });
                } else {
                    // Fallback for local testing
                    this.state.coins += 500;
                    this.refreshLobby();
                }
            };
        });

        document.querySelectorAll('.gem-pill .add-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
                    window.CrazyGames.SDK.ad.requestAd('rewarded', {
                        adStarted: () => { if (window.audioManager) window.audioManager.mute(); },
                        adFinished: () => {
                            if (window.audioManager) window.audioManager.unmute();
                            this.state.gems += 50;
                            this.refreshLobby();
                            if (window.audioManager) window.audioManager.playSound('score');
                        },
                        adError: () => { if (window.audioManager) window.audioManager.unmute(); }
                    });
                } else {
                    // Fallback for local testing
                    this.state.gems += 50;
                    this.refreshLobby();
                }
            };
        });

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
        this.timeLeft = 60;
        this.newBestNotified = false;
        this.warpMode = false;
        this.warpTimer = 0;
        this.pointsToWarp = 30;
        this.pillars = [];
        this.pistons = [];
        this.lasers = [];
        this.coins = [];
        this.powerups = [];
        this.drones = [];
        this.floaters = [];
        this.activePowerups = {};
        this.gameSpeed = zone.speed;
        this.startTime = Date.now();
        this.coinsInRun = 0;

        this.craft.reset();
        this.craft.gravity = zone.gravity;
        this.craft.shielded = true; // Starter Shield

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
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStop();
        }
    }

    resumeGame() {
        this.gameState = 'PLAYING';
        document.getElementById('pauseMenuOverlay').classList.remove('active');
        if (window.audioManager) window.audioManager.unmute();
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStart();
        }
    }

    doubleRewardsWithAd() {
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
            window.CrazyGames.SDK.ad.requestAd('rewarded', {
                adStarted: () => { if(window.audioManager) window.audioManager.mute(); },
                adFinished: () => {
                    if(window.audioManager) window.audioManager.unmute();
                    this.state.coins += this.coinsInRun; // Add another set of coins
                    this.coinsInRun *= 2;
                    document.getElementById('coinsCollected').textContent = this.coinsInRun;
                    document.getElementById('doubleRewardBtn').style.display = 'none';
                    this.refreshLobby();
                    if (window.audioManager) window.audioManager.playSound('score');
                },
                adError: () => { if(window.audioManager) window.audioManager.unmute(); }
            });
        } else {
            this.state.coins += this.coinsInRun;
            this.coinsInRun *= 2;
            document.getElementById('coinsCollected').textContent = this.coinsInRun;
            document.getElementById('doubleRewardBtn').style.display = 'none';
            this.refreshLobby();
        }
    }

    claimDailyGiftWithAd() {
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad) {
            window.CrazyGames.SDK.ad.requestAd('rewarded', {
                adStarted: () => { if(window.audioManager) window.audioManager.mute(); },
                adFinished: () => {
                    if(window.audioManager) window.audioManager.unmute();
                    const reward = 1000 + Math.floor(Math.random() * 2000);
                    this.state.coins += reward;
                    alert(`Daily Gift Claimed: 💰 ${reward} Coins!`);
                    document.getElementById('dailyGiftContainer').style.display = 'none';
                    this.refreshLobby();
                    if (window.audioManager) window.audioManager.playSound('score');
                },
                adError: () => { if(window.audioManager) window.audioManager.unmute(); }
            });
        } else {
            this.state.coins += 1000;
            alert("Daily Gift Claimed: 💰 1000 Coins!");
            document.getElementById('dailyGiftContainer').style.display = 'none';
            this.refreshLobby();
        }
    }

    gameOver() {
        if (this.gameState === 'GAMEOVER') return;
        if (this.craft.phasing || this.craft.invulnerable > 0) return;

        if (this.craft.shielded) {
            this.craft.shielded = false;
            this.craft.invulnerable = 1500; // 1.5s grace period
            this.activePowerups['shield'] = 0;
            this.shake = 8;
            this.hitStop = 3; // Snappier hit feel
            this.flash = 8;
            if (window.audioManager) window.audioManager.playSound('hit');
            return;
        }

        this.gameState = 'GAMEOVER';
        this.shake = 15;
        this.hitStop = 8; // Snappier death transition
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
            if (!this.newBestNotified && this.state.highScore > 0) {
                this.spawnFloater(this.canvas.width/2, this.canvas.height/3, "NEW BEST!", "#ffff00");
                this.flash = 15;
                if (window.audioManager) window.audioManager.playSound('score');
                this.newBestNotified = true;
            }
            this.state.highScore = this.score;
            this.bestRun = [...this.runHistory];
            localStorage.setItem('aeroDashBestRun', JSON.stringify(this.bestRun));
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
            const splash = document.getElementById('levelUpSplash');
            if (splash) {
                splash.classList.add('active');
                setTimeout(() => splash.classList.remove('active'), 3000);
            }
            this.spawnFloater(this.canvas.width/2, this.canvas.height/2, 'LEVEL UP!', '#00f2fe');
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

                this.spawnFloater(this.canvas.width/2, this.canvas.height/2 + 40, "QUEST COMPLETE: " + q.text, "#22c55e");
                if (window.audioManager) window.audioManager.playSound('score');
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

        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'flex';

        if (this.canRevive) {
            document.getElementById('reviveBtn').style.display = 'flex';
        } else {
            document.getElementById('reviveBtn').style.display = 'none';
        }

        if (this.coinsInRun > 0) {
            document.getElementById('doubleRewardBtn').style.display = 'flex';
        } else {
            document.getElementById('doubleRewardBtn').style.display = 'none';
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
        if (!this.ui.score) return;

        // Anti-Freeze Optimization: Check dirty bits before DOM manipulation
        if (this.lastUiValues.score !== this.score) {
            this.ui.score.textContent = this.score;
            this.lastUiValues.score = this.score;
        }

        if (this.boss) {
            const bossPct = (this.boss.health / this.boss.maxHealth) * 100;
            if (this.lastUiValues.bossDisplay !== 'flex') {
                this.ui.boss.style.display = 'flex';
                this.lastUiValues.bossDisplay = 'flex';
            }
            if (this.lastUiValues.bossPct !== bossPct) {
                this.ui.bossFill.style.width = bossPct + '%';
                this.lastUiValues.bossPct = bossPct;
            }
        } else if (this.lastUiValues.bossDisplay !== 'none') {
            this.ui.boss.style.display = 'none';
            this.lastUiValues.bossDisplay = 'none';
        }

        let dashPct = Math.max(0, 100 - (this.craft.phaseCooldown / 4000) * 100);
        if (this.lastUiValues.dash !== dashPct) {
            this.ui.dashFill.style.width = dashPct + '%';
            this.ui.dashFill.style.backgroundColor = dashPct === 100 ? '#00ffff' : '#ff00ff';
            this.lastUiValues.dash = dashPct;
        }

        let ultPct = (this.craft.ultimateEnergy / this.craft.ultimateMax) * 100;
        if (this.lastUiValues.ult !== ultPct) {
            this.ui.ultFill.style.width = ultPct + '%';
            this.ui.ultFill.style.backgroundColor = ultPct === 100 ? '#ffffff' : '#ff00ff';
            this.lastUiValues.ult = ultPct;
        }

        // Zone Progress
        const zone = this.zones[this.currentZoneIdx];
        let progPct = (this.score % 50) * 2;
        if (this.lastUiValues.prog !== progPct) {
            this.ui.progFill.style.width = progPct + '%';
            this.ui.progText.textContent = `${zone.name}: ${progPct}%`;
            this.lastUiValues.prog = progPct;
        }

        let comboValText = this.gameMode === 'time' ? Math.ceil(this.timeLeft) + 's' : 'x' + this.combo;
        if (this.lastUiValues.comboVal !== comboValText) {
            this.ui.comboVal.textContent = comboValText;
            this.lastUiValues.comboVal = comboValText;
        }

        if (this.lastUiValues.coins !== this.coinsInRun) {
            this.ui.coinsVal.textContent = this.coinsInRun;
            this.lastUiValues.coins = this.coinsInRun;
        }

        if (this.lastUiValues.combo !== this.combo) {
            if (this.combo > 1) {
                this.ui.comboMeter.textContent = 'COMBO x' + this.combo;
                if (!this.ui.comboMeter.classList.contains('bump')) {
                    this.ui.comboMeter.classList.add('bump');
                    setTimeout(() => this.ui.comboMeter.classList.remove('bump'), 200);
                }
            } else {
                this.ui.comboMeter.textContent = '';
            }
            this.lastUiValues.combo = this.combo;
        }

        let diffText = '';
        let diffColor = '';
        if (this.gameMode === 'time') { diffText = 'TIME ATTACK'; diffColor = '#ffcc00'; }
        else if (this.warpMode) { diffText = 'WARP MODE'; diffColor = '#ff00ff'; }
        else if (this.mutator) { diffText = 'RIFT: ' + this.mutator.name; diffColor = '#00ffff'; }
        else {
            let df = Math.min(1.0, this.score / 50);
            if (df < 0.3) { diffText = 'EASY'; diffColor = '#00ff88'; }
            else if (df < 0.7) { diffText = 'MEDIUM'; diffColor = '#ffff00'; }
            else { diffText = 'HARD'; diffColor = '#ff4b2b'; }
        }

        if (this.lastUiValues.diff !== diffText) {
            this.ui.difficulty.textContent = diffText;
            this.ui.difficulty.style.color = diffColor;
            this.lastUiValues.diff = diffText;
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        try {
            let dt = (timestamp - this.lastTime) / 16.67;
            this.lastTime = timestamp;

            // Limit dt to avoid massive leaps after a freeze/tab-switch
            if (dt > 3) dt = 1;
            if (dt <= 0) dt = 0.001;

            if (this.hitStop > 0) {
                this.hitStop -= dt;
                this.draw();
                requestAnimationFrame((t) => this.loop(t));
                return;
            }

            if (this.gameState === 'PLAYING') {
                if (this.gameMode === 'time') {
                    this.timeLeft -= (dt * 16.67) / 1000;
                    if (this.timeLeft <= 0) {
                        this.timeLeft = 0;
                        this.gameOver();
                    }
                }
                if (this.gameState === 'PLAYING') {
                    this.update(dt);
                }
            }

            this.draw();
            requestAnimationFrame((t) => this.loop(t));
        } catch (e) {
            console.error("Game Loop Error:", e);
            // Attempt to recover by resetting lastTime
            this.lastTime = 0;
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    update(dt) {
        this.updateUI();
        let speedMult = (this.activePowerups['slowmo'] > 0) ? 0.5 : 1.0;
        let effectiveDt = dt * speedMult;

        this.craft.update(effectiveDt);

        // Record ghost data
        this.runHistory.push({ y: this.craft.y, r: this.craft.rotation, p: this.craft.phasing });

        // Pillars & Difficulty - Ultra-easy balancing
        let difficultyFactor = Math.min(1.0, this.score / 100);
        let currentGap = 320 - (difficultyFactor * 100); // Extremely generous starting gaps
        let luckFactor = 1.0 + (this.state.upgrades.luck - 1) * 0.2;

        // Speed & State Timers (Must tick even during boss)
        if (this.warpMode) {
            this.gameSpeed = 12.0;
            this.warpTimer -= dt * 16.67;
            this.craft.targetX = (this.canvas.width / 4) + 100; // Lean forward in warp
            if (this.warpTimer <= 0) {
                this.warpMode = false;
                this.craft.targetX = this.canvas.width / 4;
                document.querySelector('.game-container').classList.remove('warp-active');
            }
        } else {
            this.gameSpeed = this.zones[this.currentZoneIdx].speed + (difficultyFactor * 2.5);
            this.craft.targetX = this.canvas.width / 4;
            if (this.score >= this.pointsToWarp && !this.boss) {
                this.warpMode = true;
                this.warpTimer = 5000;
                this.pointsToWarp += 40;
                this.shake = 15;
                this.craft.shielded = true; // Speed-Shield grant
                this.spawnFloater(this.craft.x, this.craft.y - 40, "SPEED SHIELD!", "#00ffff");
                document.querySelector('.game-container').classList.add('warp-active');
                if (window.audioManager) window.audioManager.playSound('score');
            }
        }

        // Mutators logic
        if (this.mutator) {
            this.mutatorTimer -= dt * 16.67;
            if (this.mutatorTimer <= 0) {
                this.mutator = null;
                this.craft.gravity = this.zones[this.currentZoneIdx].gravity;
                this.craft.jump = -6; // Unified jump power
                this.craft.invulnerable = 1000; // 1s grace period after rift
                document.querySelector('.game-container').classList.remove('rift-active');
            }
        }

        // Star Background Parallax (Linked to gameSpeed)
        for (let i = 0; i < this.stars.length; i++) {
            let layer = this.stars[i];
            let layerBaseSpeed = (3 - i) * 0.15;
            let starEffectiveSpeed = layerBaseSpeed * (this.gameSpeed * 0.8);
            for (let j = 0; j < layer.length; j++) {
                let s = layer[j];
                s.x -= starEffectiveSpeed * effectiveDt;
                if (s.x < 0) s.x = this.canvas.width;
            }
        }

        if (this.boss) {
            this.boss.update(effectiveDt, this.craft.y);

            // Check projectile collisions
            for (let i = this.boss.projectiles.length - 1; i >= 0; i--) {
                let p = this.boss.projectiles[i];
                let dx = this.craft.x - p.x;
                let dy = this.craft.y - p.y;
                if (Math.sqrt(dx*dx + dy*dy) < this.craft.radius + (p.size || 8)) {
                    if (this.craft.phasing || this.craft.shielded || this.craft.invulnerable > 0) {
                        this.boss.projectiles.splice(i, 1);
                    } else {
                        this.gameOver();
                    }
                }
            }

            if (this.boss.health <= 0) {
                this.boss = null;
                this.spawnFloater(this.canvas.width/2, this.canvas.height/2, 'BOSS DESTROYED!', '#ffd700');
                this.state.gems += 25;
                this.state.xp += 1500;
                this.shake = 30;
                this.flash = 25;
                if (window.audioManager) window.audioManager.playSound('score');
            }
        }

        if (this.score >= this.pointsToBoss && !this.boss) {
            this.boss = new BossHyperGuardian(this.canvas);
            this.pointsToBoss += 100;
            this.shake = 30;
            this.flash = 20;
            this.craft.invulnerable = 2000; // 2s grace during boss entry
            this.spawnFloater(this.canvas.width/2, this.canvas.height/2, 'BOSS INCOMING!', '#ff00ff');
        } else if (this.score >= this.pointsToMutate) {
            this.triggerMutator();
            this.pointsToMutate += 35;
        }

        if (!this.boss && (this.pillars.length === 0 || this.pillars[this.pillars.length - 1].x < this.canvas.width - (450 + difficultyFactor * 60))) {
            // Zone-specific obstacle variety
            const zoneId = this.zones[this.currentZoneIdx].id;

            if (zoneId === 'void' && Math.random() < 0.2 + difficultyFactor * 0.3) {
                this.lasers.push(new OscillatingLaser(this.canvas, this.canvas.width, this.selectedChar.color));
            } else if (zoneId === 'inferno' && Math.random() < 0.2 + difficultyFactor * 0.3) {
                this.pistons.push(new CrushingPiston(this.canvas, this.canvas.width, this.selectedChar.color));
            }

            let newPillar = new Pillar(this.canvas, this.canvas.width, this.selectedChar.color, currentGap);
            this.pillars.push(newPillar);

            if (Math.random() < 0.8 * luckFactor) {
                this.coins.push(new Coin(this.canvas, this.canvas.width + 100, newPillar.top + newPillar.gap / 2));
            }

            if (Math.random() < 0.15 * luckFactor) {
                let types = ['shield', 'magnet', 'slowmo'];
                this.powerups.push(new PowerUp(this.canvas, this.canvas.width + 150, Math.random() * (this.canvas.height - 100) + 50, types[Math.floor(Math.random() * types.length)]));
            }

            if (this.score > 20 && Math.random() < 0.3) {
                this.drones.push(new EnemyDrone(this.canvas, this.canvas.width + 200, Math.random() * (this.canvas.height - 100) + 50));
            }
        }

        // Update Pistons
        for (let i = this.pistons.length - 1; i >= 0; i--) {
            let p = this.pistons[i];
            p.update(effectiveDt, this.gameSpeed);
            if (this.craft.x + 8 > p.x && this.craft.x - 8 < p.x + p.width) {
                if (this.craft.y - 5 < p.crushY || this.craft.y + 5 > this.canvas.height - p.crushY) {
                    if (!(this.craft.phasing || this.craft.shielded || this.craft.invulnerable > 0)) this.gameOver();
                }
            }
            if (!p.passed && p.x + p.width < this.craft.x) {
                p.passed = true;
                this.score += 5; // Bonus for advanced obstacle
                this.spawnFloater(p.x, p.y || this.canvas.height / 2, "PISTON BYPASS +5", "#ff00ff");
            }
            if (p.x < -100) this.pistons.splice(i, 1);
        }

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            let l = this.lasers[i];
            l.update(effectiveDt, this.gameSpeed);
            if (Math.abs(this.craft.x - l.x) < 15) {
                if (this.craft.y < l.y - 40 || this.craft.y > l.y + 40) {
                    if (!(this.craft.phasing || this.craft.shielded || this.craft.invulnerable > 0)) this.gameOver();
                }
            }
            if (!l.passed && l.x < this.craft.x) {
                l.passed = true;
                this.score += 5;
                this.spawnFloater(l.x, l.y, "LASER ESCAPE +5", "#00ffff");
            }
            if (l.x < -100) this.lasers.splice(i, 1);
        }

        for (let i = (this.pillars ? this.pillars.length - 1 : -1); i >= 0; i--) {
            let p = this.pillars[i];
            p.update(effectiveDt, this.gameSpeed);

            // Dynamic Hitbox Scaling
            let hX = 8;
            let hY = 5;
            let nearMissThreshold = 30;
            if (this.mutator?.id === 'tiny') {
                hX *= 0.5;
                hY *= 0.5;
                nearMissThreshold *= 0.5;
            }

            // Near Miss Detection
            if (this.craft.x > p.x && this.craft.x < p.x + p.width) {
                let distTop = Math.abs(this.craft.y - p.top);
                let distBottom = Math.abs(this.craft.y - (this.canvas.height - p.bottom));
                if ((distTop < nearMissThreshold || distBottom < nearMissThreshold) && !p.nearMissed && !p.passed) {
                    p.nearMissed = true;
                    let bonus = this.warpMode ? 6 : 2;
                    this.score += bonus;
                    this.spawnFloater(this.craft.x, this.craft.y - 20, "NEAR MISS! +" + bonus, "#ff00ff");
                    this.shake = 5;
                    if (window.audioManager) window.audioManager.playSound('thrust');
                }
            }

            // Fair hitboxes: visual is radius 15, we use hX/hY for collision (very player-friendly)
            if (this.craft.x + hX > p.x && this.craft.x - hX < p.x + p.width) {
                if (this.craft.y - hY < p.top || this.craft.y + hY > this.canvas.height - p.bottom) {
                    if (this.craft.phasing || this.craft.shielded || this.craft.invulnerable > 0) {
                        // Safe!
                    } else {
                        document.querySelector('.game-container').classList.add('glitch-fx');
                        setTimeout(() => document.querySelector('.game-container').classList.remove('glitch-fx'), 300);
                        this.gameOver();
                    }
                }
            }
            if (!p.passed && p.x + p.width < this.craft.x) {
                p.passed = true;

                // Zone Transition check
                if (this.score % 50 === 0 && this.score > 0 && this.score !== this.lastZoneScore) {
                    this.lastZoneScore = this.score;
                    this.currentZoneIdx = (this.currentZoneIdx + 1) % this.zones.length;
                    const zone = this.zones[this.currentZoneIdx];
                    document.querySelector('.game-container').className = 'game-container zone-' + zone.id;
                    this.flash = 20;
                    this.shake = 15;
                    this.craft.invulnerable = 1500; // 1.5s grace period during zone transition
                    this.spawnFloater(this.canvas.width/2, this.canvas.height/2, "ENTERING " + zone.name, zone.color);
                    if (window.audioManager) window.audioManager.playSound('score');
                }

                if (this.score >= 5 && this.activePowerups['shield'] === undefined) {
                    // Logic to remove starter shield if not boosted by powerup
                    // (Simplification: just keep it for first 5 gates)
                }
                let scoreGain = this.warpMode ? this.combo * 3 : this.combo;
                this.score += scoreGain;

                // Grant shield every 25 points if speed is high
                if (this.score % 25 === 0 && this.gameSpeed > 5) {
                    this.craft.shielded = true;
                    this.spawnFloater(this.craft.x, this.craft.y - 40, "MILESTONE SHIELD!", "#00ffff");
                }

                this.combo++;
                this.flash = 6;
                this.craft.ultimateEnergy = Math.min(this.craft.ultimateMax, this.craft.ultimateEnergy + 2);
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
            let effectiveRadius = this.craft.radius * (this.mutator?.id === 'tiny' ? 0.5 : 1.0);
            if (Math.sqrt(dx*dx + dy*dy) < effectiveRadius + c.radius) {
                this.coinsInRun++;
                this.spawnFloater(c.x, c.y, '+1', '#ffd700');
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

        // Drones
        for (let i = this.drones.length - 1; i >= 0; i--) {
            let dr = this.drones[i];
            dr.update(effectiveDt, this.gameSpeed);
            let dx = this.craft.x - dr.x;
            let dy = this.craft.y - dr.y;
            let effectiveRadius = this.craft.radius * (this.mutator?.id === 'tiny' ? 0.5 : 1.0);
            if (Math.sqrt(dx*dx + dy*dy) < effectiveRadius + dr.radius) {
                if (this.craft.phasing || this.craft.shielded || this.craft.invulnerable > 0) {
                    // Destroy drone
                    this.spawnFloater(dr.x, dr.y, 'DRONE DESTROYED', '#ff0044');
                    this.shake = 10;
                    this.drones.splice(i, 1);
                    if (window.audioManager) window.audioManager.playSound('score');
                    continue;
                } else {
                    this.gameOver();
                }
            }
            if (dr.x < -50) this.drones.splice(i, 1);
        }

        // Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            let pu = this.powerups[i];
            pu.update(effectiveDt, this.gameSpeed);
            let dx = this.craft.x - pu.x;
            let dy = this.craft.y - pu.y;
            let effectiveRadius = this.craft.radius * (this.mutator?.id === 'tiny' ? 0.5 : 1.0);
            if (Math.sqrt(dx*dx + dy*dy) < effectiveRadius + pu.radius) {
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
                    if (type === 'shield' && this.score >= 5) this.craft.shielded = false;
                    if (type === 'magnet') this.craft.magnetized = false;
                    delete this.activePowerups[type];
                }
            }
        }
        if (this.score >= 5 && (this.activePowerups['shield'] || 0) <= 0 && !this.warpMode) {
            this.craft.shielded = false;
        }

        // Floaters Update with Pooling
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            let f = this.floaters[i];
            f.update(dt);
            if (!f.active) {
                this.floaterPool.push(this.floaters.splice(i, 1)[0]);
            }
        }

        let effectiveRadius = this.craft.radius * (this.mutator?.id === 'tiny' ? 0.5 : 1.0);
        if (this.craft.y > this.canvas.height + 40 || this.craft.y < -40) {
            if (!(this.craft.phasing || this.craft.invulnerable > 0)) {
                this.gameOver();
            }
        }

        if (this.shake > 0) this.shake -= dt;
        if (this.flash > 0) this.flash -= dt;

        // Cleanup out-of-bounds particles for better perf
        if (this.craft.particles.length > 100) this.craft.particles.splice(0, 20);
    }

    clearObstacles() {
        this.pillars = [];
        this.drones = [];
        this.shake = 10;
        this.spawnFloater(this.canvas.width/2, this.canvas.height/2, "SKY CLEARED!", "#ffcc00");
    }

    triggerMutator() {
        const mutators = [
            { id: 'tiny', name: 'TINY CRAFT' }
        ];
        this.mutator = mutators[Math.floor(Math.random() * mutators.length)];
        this.mutatorTimer = 8000; // 8 seconds
        this.shake = 20;
        this.flash = 10;
        document.querySelector('.game-container').classList.add('rift-active');
        if (window.audioManager) window.audioManager.playSound('score');
        this.spawnFloater(this.canvas.width/2, this.canvas.height/2, "RIFT: " + this.mutator.name, "#00ffff");
    }

    applyPowerup(type) {
        if (window.audioManager) window.audioManager.playSound('score');
        const upgradeLevel = this.state.upgrades[type] || 1;
        this.activePowerups[type] = 300 + (upgradeLevel * 60); // Base 5s + 1s per level
        if (type === 'shield') this.craft.shielded = true;
        if (type === 'magnet') this.craft.magnetized = true;
    }

    spawnFloater(x, y, text, color) {
        let f = this.floaterPool.pop() || new ScoreFloater();
        f.reset(x, y, text, color);
        this.floaters.push(f);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();

        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }

        // Dynamic Camera Zoom/Tilt
        let zoom = 1.0 + (this.gameSpeed / 25);
        ctx.translate(this.canvas.width / 4, this.canvas.height / 2);
        ctx.scale(zoom, zoom);
        ctx.rotate(this.craft.velocity * 0.005);
        ctx.translate(-this.canvas.width / 4, -this.canvas.height / 2);

        ctx.fillStyle = '#fff';
        if (this.gameSpeed > 8) {
            ctx.strokeStyle = `rgba(255,255,255,${0.1 + (this.gameSpeed - 8) * 0.05})`;
            ctx.lineWidth = 2;
            for(let i=0; i<15; i++) {
                let y = ((i * 137) % this.canvas.height);
                let x = (this.canvas.width * 2 - (Date.now() * (this.gameSpeed * 0.02) + (i * 500))) % this.canvas.width;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 150, y);
                ctx.stroke();
            }
        }

        // Background Buildings Parallax
        for (let i = 0; i < this.buildings.length; i++) {
            let layer = this.buildings[i];
            let layerSpeed = (i + 1) * 0.2 * this.gameSpeed;
            for (let b of layer) {
                b.x -= layerSpeed * 0.1;
                if (b.x + b.w < 0) b.x = this.canvas.width;
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, this.canvas.height - b.h, b.w, b.h);
                // Window highlights
                ctx.fillStyle = 'rgba(0, 242, 254, 0.1)';
                ctx.fillRect(b.x + 10, this.canvas.height - b.h + 20, b.w - 20, 10);
            }
        }

        for (let i = 0; i < this.stars.length; i++) {
            let layer = this.stars[i];
            ctx.globalAlpha = (3 - i) * 0.25;
            for (let j = 0; j < layer.length; j++) {
                let s = layer[j];
                ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        for (let i = 0; i < this.pistons.length; i++) this.pistons[i].draw();
        for (let i = 0; i < this.lasers.length; i++) this.lasers[i].draw();

        for (let i = 0; i < this.pillars.length; i++) {
            let p = this.pillars[i];
            p.draw();
            // Safe Zone Indicator
            if (this.gameState === 'PLAYING' && !p.passed && p.x > this.craft.x && p.x < this.canvas.width) {
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = this.selectedChar.color;
                ctx.fillRect(p.x, p.top, p.width, p.gap);
                ctx.restore();
            }
        }

        // Ghost Pilot
        if (this.bestRun && this.bestRun.length > this.runHistory.length) {
            let ghostData = this.bestRun[this.runHistory.length];
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.translate(this.craft.x, ghostData.y);
            ctx.rotate(ghostData.r);
            if (ghostData.p) ctx.filter = 'hue-rotate(90deg) brightness(1.5)';

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(18, 0); ctx.lineTo(-12, -12); ctx.lineTo(-8, 0); ctx.lineTo(-12, 12);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        for (let i = 0; i < this.drones.length; i++) this.drones[i].draw();
        if (this.boss) this.boss.draw();
        for (let i = 0; i < this.coins.length; i++) this.coins[i].draw();
        for (let i = 0; i < this.powerups.length; i++) this.powerups[i].draw();

        if (this.mutator?.id === 'tiny') {
            ctx.save();
            ctx.translate(this.craft.x, this.craft.y);
            ctx.scale(0.5, 0.5);
            ctx.translate(-this.craft.x, -this.craft.y);
            this.craft.draw();
            ctx.restore();
        } else {
            this.craft.draw();
        }

        for (let i = (this.floaters ? this.floaters.length - 1 : -1); i >= 0; i--) {
            if (this.floaters[i]) this.floaters[i].draw(ctx);
        }

        if (this.flash > 0 && this.gameState !== 'START') {
            let opacity = Math.min(0.8, this.flash * 0.08);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.restore();
    }
}

window.onload = () => {
    if (window.CrazyGames && window.CrazyGames.SDK) {
        window.CrazyGames.SDK.game.sdkGameLoadingStart();
    }
    window.game = new Game();
    if (window.CrazyGames && window.CrazyGames.SDK) {
        window.CrazyGames.SDK.game.sdkGameLoadingStop();
    }
};
