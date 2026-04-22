import { Scene } from 'phaser';
import { CONFIG } from '../config.js';
import { ENEMY_TYPES } from '../data/enemyTypes.js';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(512, 350, 'SCOTT KILLER', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#cc0000',
        }).setOrigin(0.5);

        this.add.rectangle(512, 400, 300, 20).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512 - 148, 400, 4, 16, 0xcc0000);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (292 * progress);
        });
    }

    preload() {
        // No external assets — we generate everything procedurally
    }

    create() {
        const gfx = this.make.graphics({ add: false });

        // Wall tile
        this.genTexture(gfx, 'tile-wall', CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.COLORS.WALL);

        // Player (blue square with white "nose" for direction)
        gfx.clear();
        gfx.fillStyle(CONFIG.PLAYER.COLOR, 1);
        gfx.fillRect(0, 0, CONFIG.PLAYER.SIZE, CONFIG.PLAYER.SIZE);
        gfx.fillStyle(0xffffff, 1);
        gfx.fillRect(CONFIG.PLAYER.SIZE - 4, CONFIG.PLAYER.SIZE / 2 - 2, 6, 4);
        gfx.generateTexture('player', CONFIG.PLAYER.SIZE + 2, CONFIG.PLAYER.SIZE);
        gfx.clear();

        // Bullets
        this.genTexture(gfx, 'bullet-player', CONFIG.BULLET.SIZE + 2, CONFIG.BULLET.SIZE + 2, CONFIG.BULLET.PLAYER_COLOR);
        this.genTexture(gfx, 'bullet-enemy', CONFIG.BULLET.SIZE + 2, CONFIG.BULLET.SIZE + 2, CONFIG.BULLET.ENEMY_COLOR);

        // Clue (gold circle)
        gfx.clear();
        gfx.fillStyle(CONFIG.COLORS.CLUE, 1);
        gfx.fillCircle(8, 8, 8);
        gfx.generateTexture('clue', 16, 16);
        gfx.clear();

        // Enemy textures
        for (const [key, type] of Object.entries(ENEMY_TYPES)) {
            this.genTexture(gfx, `enemy-${key}`, type.size, type.size, type.color);
        }

        // VFX particle (small white circle for trails & death particles)
        gfx.clear();
        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(3, 3, 3);
        gfx.generateTexture('vfx-particle', 6, 6);
        gfx.clear();

        gfx.destroy();
        this.scene.start('MainMenu');
    }

    genTexture(gfx, key, w, h, color) {
        gfx.clear();
        gfx.fillStyle(color, 1);
        gfx.fillRect(0, 0, w, h);
        gfx.generateTexture(key, w, h);
    }
}
