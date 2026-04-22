import { Input, Math as PhaserMath } from 'phaser';
import { CONFIG } from '../config.js';

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.body.setCollideWorldBounds(false);
        this.sprite.setDepth(5);

        this.hp = CONFIG.PLAYER.MAX_HP;
        this.maxHp = CONFIG.PLAYER.MAX_HP;
        this.lastFireTime = 0;
        this.alive = true;
        this.invincible = false;

        this.keys = scene.input.keyboard.addKeys({
            up: Input.Keyboard.KeyCodes.W,
            down: Input.Keyboard.KeyCodes.S,
            left: Input.Keyboard.KeyCodes.A,
            right: Input.Keyboard.KeyCodes.D,
            upAlt: Input.Keyboard.KeyCodes.Z,
        });
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    update(time) {
        if (!this.alive) return;

        let vx = 0, vy = 0;
        if (this.keys.left.isDown || this.cursors.left.isDown) vx -= 1;
        if (this.keys.right.isDown || this.cursors.right.isDown) vx += 1;
        if (this.keys.up.isDown || this.keys.upAlt.isDown || this.cursors.up.isDown) vy -= 1;
        if (this.keys.down.isDown || this.cursors.down.isDown) vy += 1;

        if (vx !== 0 && vy !== 0) {
            vx *= 0.7071;
            vy *= 0.7071;
        }

        this.sprite.body.setVelocity(
            vx * CONFIG.PLAYER.SPEED,
            vy * CONFIG.PLAYER.SPEED
        );

        const pointer = this.scene.input.activePointer;
        const cam = this.scene.cameras.main;
        const worldX = pointer.x + cam.scrollX;
        const worldY = pointer.y + cam.scrollY;
        this.sprite.rotation = PhaserMath.Angle.Between(
            this.sprite.x, this.sprite.y, worldX, worldY
        );
    }

    getAimAngle() {
        return this.sprite.rotation;
    }

    canFire(time) {
        return this.alive && (time - this.lastFireTime >= CONFIG.PLAYER.FIRE_RATE);
    }

    fire(time) {
        this.lastFireTime = time;
    }

    takeDamage(amount) {
        if (this.invincible || !this.alive) return;
        this.hp = Math.max(0, this.hp - amount);
        this.invincible = true;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.alpha = 1;
                }
                this.invincible = false;
            }
        });

        if (this.hp <= 0) this.die();
    }

    die() {
        this.alive = false;
        this.sprite.body.setVelocity(0, 0);
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 500,
            onComplete: () => this.scene.onPlayerDeath()
        });
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}
