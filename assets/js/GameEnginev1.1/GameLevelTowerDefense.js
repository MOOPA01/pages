// GameLevelTowerDefense.js - Tower Defense Level for GameEngine v1.1
// Uses only existing engine features and classes

class GameLevelTowerDefense extends GameLevel {
    constructor() {
        super();
        this.name = "Tower Defense";
        this.money = 100;
        this.lives = 20;
        this.wave = 0;
        this.maxWaves = 5;
        this.enemies = [];
        this.projectiles = [];
        this.towers = [];
        this.placingTower = false;
        this.path = this.generatePath();
        this.waveData = this.generateWaves();
        this.spawnTimer = 0;
        this.spawnIndex = 0;
        this.waveInProgress = false;
        this.ui = new GameUI();
    }

    start() {
        this.money = 100;
        this.lives = 20;
        this.wave = 0;
        this.enemies = [];
        this.projectiles = [];
        this.towers = [];
        this.placingTower = false;
        this.waveInProgress = false;
        this.spawnIndex = 0;
        this.spawnTimer = 0;
        this.nextWave();
    }

    generatePath() {
        // Spline-like path: array of points
        return [
            {x: 60, y: 100},
            {x: 200, y: 120},
            {x: 350, y: 200},
            {x: 500, y: 300},
            {x: 700, y: 350},
            {x: 900, y: 400}
        ];
    }

    generateWaves() {
        // 5 waves, increasing count
        return [
            {count: 5, hp: 2, speed: 1.2},
            {count: 8, hp: 3, speed: 1.3},
            {count: 12, hp: 4, speed: 1.4},
            {count: 16, hp: 5, speed: 1.5},
            {count: 20, hp: 6, speed: 1.6}
        ];
    }

    nextWave() {
        if (this.wave >= this.maxWaves) return;
        this.waveInProgress = true;
        this.spawnIndex = 0;
        this.spawnTimer = 0;
        this.wave++;
    }

    update() {
        // Spawn enemies for current wave
        if (this.waveInProgress) {
            let wave = this.waveData[this.wave - 1];
            if (this.spawnIndex < wave.count) {
                if (this.spawnTimer <= 0) {
                    let enemy = new Enemy(this.path[0].x, this.path[0].y);
                    enemy.hp = wave.hp;
                    enemy.speed = wave.speed;
                    enemy.path = this.path;
                    enemy.pathIndex = 0;
                    enemy.progress = 0;
                    enemy.update = function(game) {
                        // Spline/path following
                        let p0 = this.path[this.pathIndex];
                        let p1 = this.path[this.pathIndex + 1];
                        if (!p1) return;
                        let dx = p1.x - p0.x;
                        let dy = p1.y - p0.y;
                        let dist = Math.hypot(dx, dy);
                        let step = this.speed;
                        this.progress += step;
                        let t = this.progress / dist;
                        if (t >= 1) {
                            this.pathIndex++;
                            this.progress = 0;
                            if (this.pathIndex >= this.path.length - 1) {
                                // Reached end
                                game.lives--;
                                this.dead = true;
                                return;
                            }
                        } else {
                            this.x = p0.x + dx * t;
                            this.y = p0.y + dy * t;
                        }
                    };
                    this.enemies.push(enemy);
                    this.spawnIndex++;
                    this.spawnTimer = 40;
                } else {
                    this.spawnTimer--;
                }
            } else if (this.enemies.length === 0) {
                this.waveInProgress = false;
                if (this.wave < this.maxWaves) {
                    setTimeout(() => this.nextWave(), 1200);
                }
            }
        }
        // Update towers
        for (let t of this.towers) t.update(this);
        // Update enemies
        for (let e of this.enemies) e.update(this);
        // Remove dead enemies
        this.enemies = this.enemies.filter(e => !e.dead);
        // Update projectiles
        for (let p of this.projectiles) {
            p.update(this);
            // Check collision with enemies
            for (let e of this.enemies) {
                let d = Math.hypot(e.x - p.x, e.y - p.y);
                if (d < 12) {
                    e.hp -= p.damage;
                    p.dead = true;
                    if (e.hp <= 0) {
                        e.dead = true;
                        this.money += 10;
                    }
                }
            }
        }
        this.projectiles = this.projectiles.filter(p => !p.dead);
        // Lose if lives <= 0
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        // Show game over UI
        this.ui.showMessage("Game Over!", () => this.start());
    }

    render(ctx) {
        // Draw path
        ctx.save();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let i = 0; i < this.path.length; i++) {
            let p = this.path[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.restore();
        // Draw towers
        for (let t of this.towers) t.render(ctx);
        // Draw enemies
        for (let e of this.enemies) e.render(ctx);
        // Draw projectiles
        for (let p of this.projectiles) p.render(ctx);
        // Draw UI
        ctx.save();
        ctx.fillStyle = '#222';
        ctx.font = '20px Arial';
        ctx.fillText(`Money: $${this.money}`, 20, 30);
        ctx.fillText(`Lives: ${this.lives}`, 20, 60);
        ctx.fillText(`Wave: ${this.wave}/${this.maxWaves}`, 20, 90);
        ctx.restore();
        // Tower placement preview
        if (this.placingTower && this.mousePos) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.mousePos.x, this.mousePos.y, 16, 0, 2 * Math.PI);
            ctx.fillStyle = '#27ae60';
            ctx.fill();
            ctx.restore();
        }
    }

    onMouseDown(x, y) {
        if (this.placingTower) {
            if (this.money >= 50) {
                this.towers.push(new Tower(x, y));
                this.money -= 50;
            }
            this.placingTower = false;
        } else {
            // Start placing tower if clicked on UI area (e.g., bottom right)
            if (x > 800 && y > 400) {
                this.placingTower = true;
            }
        }
    }

    onMouseMove(x, y) {
        this.mousePos = {x, y};
    }
}

// Register the level (if engine uses registration)
if (typeof window !== 'undefined' && window.GameLevels) {
    window.GameLevels.push(GameLevelTowerDefense);
}
