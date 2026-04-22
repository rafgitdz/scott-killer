import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CONFIG } from '../config.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        // Title
        this.add.text(512, 180, 'SCOTT', {
            fontFamily: 'Arial Black', fontSize: 80,
            color: '#cc0000', stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5);

        this.add.text(512, 260, 'KILLER', {
            fontFamily: 'Arial Black', fontSize: 80,
            color: '#ffffff', stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5);

        this.add.text(512, 320, 'JUSTICE WILL BE SERVED', {
            fontFamily: 'Arial', fontSize: 16, color: '#666666',
        }).setOrigin(0.5);

        // New Game
        const newBtn = this.add.text(512, 440, '[ NOUVELLE ENQUÊTE ]', {
            fontFamily: 'Arial', fontSize: 26, color: '#ffffff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        newBtn.on('pointerover', () => newBtn.setColor('#cc0000'));
        newBtn.on('pointerout', () => newBtn.setColor('#ffffff'));
        newBtn.on('pointerdown', () => this.scene.start('InvestigationSelect'));

        // Continue (if save exists)
        const saveData = localStorage.getItem('scottKiller_save');
        if (saveData) {
            const contBtn = this.add.text(512, 500, '[ CONTINUER ]', {
                fontFamily: 'Arial', fontSize: 26, color: '#ffffff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            contBtn.on('pointerover', () => contBtn.setColor('#cc0000'));
            contBtn.on('pointerout', () => contBtn.setColor('#ffffff'));
            contBtn.on('pointerdown', () => {
                const save = JSON.parse(saveData);
                this.scene.start('StageIntro', save);
            });
        }

        // Controls hint
        this.add.text(512, 700, 'ZQSD / WASD — Déplacer  |  SOURIS — Viser  |  CLIC — Tirer', {
            fontFamily: 'Arial', fontSize: 12, color: '#444444',
        }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
    }
}
