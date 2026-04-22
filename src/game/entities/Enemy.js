import { Math as PhaserMath } from 'phaser';
import { ENEMY_TYPES } from '../data/enemyTypes.js';
import { CONFIG } from '../config.js';

export class Enemy {
    constructor(scene, x, y, type = 'grunt') {
        this.scene = scene;
        this.type = type;
        this.stats = { ...ENEMY_TYPES[type] };

        this.sprite = scene.physics.add.sprite(x, y, `enemy-${type}`);
        this.sprite.body.setCollideWorldBounds(false);
        this.sprite.setDepth(4);

        this.hp = this.stats.hp;
        this.maxHp = this.stats.hp;
        this.alive = true;
        this.lastFireTime = 0;

        // AI state
        this.state = 'patrol';
        this.patrolOrigin = { x, y };
        this.patrolTarget = null;
        this.patrolWaitTimer = 0;

        // HP bar
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(10);
    }

    update(time, delta, player) {
        if (!this.alive) return;
        if (!player.alive || !player.sprite?.active) {
            this.sprite.body.setVelocity(0, 0);
            return;
        }

        const dist = PhaserMath.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        if (dist < this.stats.detectionRange && player.alive) {
            this.state = dist < this.stats.attackRange ? 'attack' : 'chase';
        } else if (this.state !== 'patrol') {
            this.state = 'patrol';
            this.patrolTarget = null;
        }

        switch (this.state) {
            case 'patrol': this.doPatrol(time); break;
            case 'chase': this.doChase(player); break;
            case 'attack': this.doAttack(time, player); break;
        }

        this.drawHPBar();
    }

    doPatrol(time) {
        if (!this.patrolTarget || this.reachedTarget()) {
            this.sprite.body.setVelocity(0, 0);
            if (!this.patrolWaitTimer) {
                this.patrolWaitTimer = time + 1500 + Math.random() * 1000;
            }
            if (time >= this.patrolWaitTimer) {
                this.patrolWaitTimer = 0;
                this.pickPatrolTarget();
            }
            return;
        }

        // Stuck detection: if barely moving, re-pick target
        const vel = this.sprite.body.velocity;
        if (this.lastPatrolCheck && time - this.lastPatrolCheck > 2000) {
            const moved = PhaserMath.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.lastPatrolPos?.x || this.sprite.x,
                this.lastPatrolPos?.y || this.sprite.y
            );
            if (moved < 5) {
                this.pickPatrolTarget();
            }
            this.lastPatrolCheck = time;
            this.lastPatrolPos = { x: this.sprite.x, y: this.sprite.y };
        }
        if (!this.lastPatrolCheck) {
            this.lastPatrolCheck = time;
            this.lastPatrolPos = { x: this.sprite.x, y: this.sprite.y };
        }

        this.moveToward(this.patrolTarget, this.stats.speed * 0.4);
    }

    doChase(player) {
        this.moveToward(player.sprite, this.stats.speed);
    }

    doAttack(time, player) {
        const angle = PhaserMath.Angle.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );
        this.sprite.rotation = angle;
        this.sprite.body.setVelocity(
            Math.cos(angle) * this.stats.speed * 0.2,
            Math.sin(angle) * this.stats.speed * 0.2
        );

        if (time - this.lastFireTime >= this.stats.fireRate) {
            this.lastFireTime = time;
            this.scene.createBullet(
                this.sprite.x, this.sprite.y,
                angle, false, this.stats.bulletDamage
            );
        }
    }

    moveToward(target, speed) {
        const angle = PhaserMath.Angle.Between(
            this.sprite.x, this.sprite.y, target.x, target.y
        );
        this.sprite.rotation = angle;
        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    reachedTarget() {
        if (!this.patrolTarget) return true;
        return PhaserMath.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.patrolTarget.x, this.patrolTarget.y
        ) < 10;
    }

    pickPatrolTarget() {
        this.patrolTarget = {
            x: this.patrolOrigin.x + PhaserMath.Between(-60, 60),
            y: this.patrolOrigin.y + PhaserMath.Between(-60, 60),
        };
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.hp = Math.max(0, this.hp - amount);

        if (this.sprite?.active) this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(80, () => {
            if (this.sprite?.active) this.sprite.clearTint();
        });

        if (this.scene?.scene?.isActive()) {
            this.scene.alertNearbyEnemies(this.sprite.x, this.sprite.y);
        }

        if (this.hp <= 0) this.die();
    }

    die() {
        this.alive = false;
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.enable = false;
        if (this.hpBar) {
            this.hpBar.destroy();
            this.hpBar = null;
        }

        const deathX = this.sprite.x;
        const deathY = this.sprite.y;
        const sceneRef = this.scene;

        // Death particles — small red burst
        const deathParticles = sceneRef.add.particles(deathX, deathY, 'vfx-particle', {
            speed: { min: 40, max: 140 },
            lifespan: 350,
            alpha: { start: 1, end: 0 },
            scale: { start: 0.6, end: 0 },
            quantity: 8,
            tint: 0xff2222,
            emitting: false,
        }).setDepth(10);
        deathParticles.explode(8);
        sceneRef.time.delayedCall(400, () => {
            if (deathParticles?.active) deathParticles.destroy();
        });

        // Kill confirmed indicator
        const killMark = sceneRef.add.text(deathX, deathY, '✕', {
            fontSize: '18px', color: '#ff4444',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(15);
        sceneRef.tweens.add({
            targets: killMark,
            y: deathY - 20,
            alpha: 0,
            duration: 500,
            onComplete: () => { if (killMark?.active) killMark.destroy(); },
        });

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            onComplete: () => {
                if (this.sprite) this.sprite.destroy();
                if (this.scene?.scene?.isActive()) {
                    this.scene.onEnemyDeath(this);
                }
            }
        });
    }

    drawHPBar() {
        if (!this.hpBar || !this.alive) return;
        this.hpBar.clear();

        const barWidth = 30;
        const barHeight = 4;
        const x = this.sprite.x - barWidth / 2;
        const y = this.sprite.y - this.stats.size / 2 - 8;

        this.hpBar.fillStyle(0x000000);
        this.hpBar.fillRect(x, y, barWidth, barHeight);

        const pct = this.hp / this.maxHp;
        const color = pct > 0.5 ? 0x00cc00 : pct > 0.25 ? 0xcccc00 : 0xcc0000;
        this.hpBar.fillStyle(color);
        this.hpBar.fillRect(x, y, barWidth * pct, barHeight);
    }

    destroy() {
        if (this.hpBar) this.hpBar.destroy();
        if (this.sprite) this.sprite.destroy();
    }
}
