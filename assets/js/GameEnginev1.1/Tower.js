// Tower.js - Basic Tower for Tower Defense Level
// Uses GameEnginev1.1 conventions

class Tower extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.range = 120;
        this.fireRate = 60; // frames between shots
        this.cooldown = 0;
        this.target = null;
        this.cost = 50;
    }

    update(game) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }
        // Find nearest enemy in range
        let enemies = game.enemies || [];
        let closest = null;
        let minDist = this.range;
        for (let e of enemies) {
            let d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) {
                minDist = d;
                closest = e;
            }
        }
        if (closest) {
            this.shootAt(closest, game);
            this.cooldown = this.fireRate;
        }
    }

    shootAt(enemy, game) {
        // Use existing Projectile class
        let angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
        let speed = 6;
        let proj = new Projectile(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed);
        proj.target = enemy;
        proj.damage = 1;
        game.projectiles.push(proj);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw range
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(0, 0, this.range, 0, 2 * Math.PI);
        ctx.fillStyle = '#2980b9';
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
}
