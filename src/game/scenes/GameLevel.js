import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Math as PhaserMath } from 'phaser';
import { CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Clue } from '../entities/Clue.js';
import { buildLevel } from '../systems/LevelBuilder.js';
import { INVESTIGATIONS } from '../data/investigations.js';

export class GameLevel extends Scene {
    constructor() {
        super('GameLevel');
    }

    init(data) {
        this.investigationId = data.investigationId || 0;
        this.stageIndex = data.stageIndex || 0;
    }

    create() {
        this.transitioning = false;

        const investigation = INVESTIGATIONS[this.investigationId];
        const stage = investigation.stages[this.stageIndex];
        this.stageData = stage;

        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        // Draw floor tiles FIRST (depth 0)
        const stageLayout = stage.layout;
        for (let row = 0; row < stageLayout.length; row++) {
            for (let col = 0; col < stageLayout[row].length; col++) {
                if (stageLayout[row][col] !== '#') {
                    const x = col * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const y = row * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    this.add.rectangle(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.COLORS.FLOOR).setDepth(0);
                }
            }
        }

        // Build level (walls at depth 1)
        const level = buildLevel(this, stageLayout);
        this.walls = level.walls;
        this.walls.children.each(w => w.setDepth(1));

        this.physics.world.setBounds(0, 0, level.width, level.height);
        this.cameras.main.setBounds(0, 0, level.width, level.height);

        // Player
        this.player = new Player(this, level.playerSpawn.x, level.playerSpawn.y);

        // Enemies
        this.enemies = [];
        this.enemyGroup = this.physics.add.group();
        level.enemySpawns.forEach(spawn => {
            const enemy = new Enemy(this, spawn.x, spawn.y, spawn.type);
            this.enemies.push(enemy);
            this.enemyGroup.add(enemy.sprite);
        });

        // Bullet groups
        this.playerBullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // Clue tracking
        this.clueSpawn = level.clueSpawn;
        this.clue = null;
        this.allEnemiesDead = false;
        this.enemiesRemaining = this.enemies.length;

        // ── Collisions ──
        this.physics.add.collider(this.player.sprite, this.walls);
        this.physics.add.collider(this.enemyGroup, this.walls);

        this.physics.add.overlap(this.playerBullets, this.walls, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.overlap(this.enemyBullets, this.walls, (bullet) => {
            bullet.destroy();
        });

        this.physics.add.overlap(this.playerBullets, this.enemyGroup, (bullet, enemySprite) => {
            if (this.transitioning) return;
            if (!bullet?.active) return;
            bullet.destroy();
            const enemy = this.enemies.find(e => e.sprite === enemySprite);
            if (enemy && enemy.alive) {
                enemy.takeDamage(CONFIG.BULLET.DAMAGE);
            }
        });

        // NOTE: single sprite vs group → callback is (singleSprite, groupMember)
        this.physics.add.overlap(this.enemyBullets, this.player.sprite, (playerSprite, bullet) => {
            if (this.transitioning) return;
            if (!bullet?.active || !playerSprite?.active) return;
            const dmg = bullet.getData('damage') || CONFIG.ENEMY.BULLET_DAMAGE;
            bullet.destroy();
            this.player.takeDamage(dmg);
        });

        // Camera
        this.cameras.main.startFollow(this.player.sprite, false, 0.1, 0.1);

        // Shoot on click
        this.input.on('pointerdown', () => {
            if (this.transitioning) return;
            if (this.player.alive && this.player.canFire(this.time.now)) {
                this.player.fire(this.time.now);
                const angle = this.player.getAimAngle();
                this.createBullet(
                    this.player.sprite.x, this.player.sprite.y,
                    angle, true, CONFIG.BULLET.DAMAGE
                );
            }
        });

        // HUD
        this.createHUD(stage.name);

        EventBus.emit('current-scene-ready', this);
    }

    update(time, delta) {
        if (this.transitioning) return;

        this.player.update(time);

        this.enemies.forEach(e => e.update(time, delta, this.player));

        // Destroy bullets that traveled too far
        [this.playerBullets, this.enemyBullets].forEach(group => {
            group.children.each(bullet => {
                if (!bullet || !bullet.active) return;
                const sx = bullet.getData('startX');
                const sy = bullet.getData('startY');
                const dx = bullet.x - sx;
                const dy = bullet.y - sy;
                if (dx * dx + dy * dy > CONFIG.BULLET.MAX_DISTANCE * CONFIG.BULLET.MAX_DISTANCE) {
                    bullet.destroy();
                }
            });
        });

        // Check all enemies eliminated
        if (!this.allEnemiesDead && this.enemies.every(e => !e.alive)) {
            this.allEnemiesDead = true;
            this.spawnClue();
        }

        this.updateHUD();
    }

    // ── Bullet factory (used by player & enemies) ──
    createBullet(x, y, angle, isPlayer, damage) {
        if (this.transitioning) return null;

        const key = isPlayer ? 'bullet-player' : 'bullet-enemy';
        const group = isPlayer ? this.playerBullets : this.enemyBullets;

        const bullet = group.create(x, y, key);
        if (!bullet) return null;

        bullet.setDepth(6);
        bullet.setData('startX', x);
        bullet.setData('startY', y);
        bullet.setData('damage', damage);
        bullet.body.setVelocity(
            Math.cos(angle) * CONFIG.BULLET.SPEED,
            Math.sin(angle) * CONFIG.BULLET.SPEED
        );
        bullet.rotation = angle;
        bullet.body.setSize(CONFIG.BULLET.SIZE, CONFIG.BULLET.SIZE);

        // Muzzle flash
        const flashColor = isPlayer ? 0xffee88 : 0xff8888;
        const flash = this.add.circle(x, y, 6, flashColor, 1).setDepth(7);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.8,
            duration: 80,
            onComplete: () => flash.destroy(),
        });

        // Bullet trail
        const trail = this.add.particles(x, y, 'vfx-particle', {
            speed: 0,
            lifespan: 120,
            alpha: { start: 0.35, end: 0 },
            scale: { start: 0.5, end: 0.1 },
            tint: isPlayer ? CONFIG.BULLET.PLAYER_COLOR : CONFIG.BULLET.ENEMY_COLOR,
            follow: bullet,
            frequency: 30,
            quantity: 1,
        }).setDepth(5);

        bullet.on('destroy', () => {
            trail.stop();
            if (this.scene && this.scene.isActive()) {
                this.time.delayedCall(150, () => trail.destroy());
            } else {
                trail.destroy();
            }
        });

        return bullet;
    }

    // ── Clue spawning ──
    spawnClue() {
        this.clue = new Clue(this, this.clueSpawn.x, this.clueSpawn.y);

        this.showMessage('ZONE NETTOYÉE — CHERCHE L\'INDICE !');

        this.physics.add.overlap(this.player.sprite, this.clue.sprite, () => {
            if (this.transitioning) return;
            if (!this.clue.collected) {
                this.clue.collect();
                this.onClueCollected();
            }
        });
    }

    alertNearbyEnemies(x, y) {
        if (this.transitioning) return;
        this.enemies.forEach(e => {
            if (!e.alive || !e.sprite?.active) return;
            const dist = PhaserMath.Distance.Between(x, y, e.sprite.x, e.sprite.y);
            if (dist < CONFIG.ENEMY.ALERT_RANGE) {
                e.state = 'chase';
            }
        });
    }

    onEnemyDeath() {
        if (this.transitioning) return;
        this.enemiesRemaining = this.enemies.filter(e => e.alive).length;
    }

    onPlayerDeath() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.cameras.main.fade(400, 0, 0, 0, false, (_cam, progress) => {
            if (progress >= 1) {
                this.scene.start('GameOver', {
                    investigationId: this.investigationId,
                    stageIndex: this.stageIndex,
                });
            }
        });
    }

    onClueCollected() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.cameras.main.fade(400, 0, 0, 0, false, (_cam, progress) => {
            if (progress >= 1) {
                this.scene.start('StageComplete', {
                    investigationId: this.investigationId,
                    stageIndex: this.stageIndex,
                    clueText: this.stageData.clueText,
                });
            }
        });
    }

    // ── HUD ──
    createHUD(stageName) {
        this.hudStageName = this.add.text(16, 16, stageName, {
            fontSize: '16px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
        }).setScrollFactor(0).setDepth(100);

        this.hudHpBg = this.add.rectangle(91, 45, 150, 12, 0x333333)
            .setScrollFactor(0).setDepth(100);

        this.hudHpFill = this.add.rectangle(16, 45, 150, 12, CONFIG.COLORS.HP_FULL)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        this.hudHpText = this.add.text(16, 56, '', {
            fontSize: '11px', color: '#ffffff',
        }).setScrollFactor(0).setDepth(100);

        this.hudEnemyCount = this.add.text(16, 74, '', {
            fontSize: '14px', color: '#cc3333',
            stroke: '#000000', strokeThickness: 2,
        }).setScrollFactor(0).setDepth(100);

        this.hudMessage = this.add.text(
            CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 + 100, '', {
                fontSize: '20px', color: '#ffd700',
                stroke: '#000000', strokeThickness: 4, align: 'center',
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);
    }

    updateHUD() {
        const hpPct = this.player.hp / this.player.maxHp;
        this.hudHpFill.width = 150 * hpPct;
        this.hudHpFill.setFillStyle(hpPct > 0.5 ? CONFIG.COLORS.HP_FULL : CONFIG.COLORS.HP_LOW);
        this.hudHpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`);
        this.hudEnemyCount.setText(`Ennemis: ${this.enemiesRemaining}`);
    }

    showMessage(text) {
        this.hudMessage.setText(text);
        this.tweens.add({
            targets: this.hudMessage,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 2000,
        });
    }
}
