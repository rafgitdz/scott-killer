import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CONFIG } from '../config.js';
import { INVESTIGATIONS } from '../data/investigations.js';

export class InvestigationSelect extends Scene {
    constructor() {
        super('InvestigationSelect');
    }

    create() {
        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        this.add.text(512, 60, 'SÉLECTION D\'ENQUÊTE', {
            fontFamily: 'Arial Black', fontSize: 36,
            color: '#cc0000', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);

        INVESTIGATIONS.forEach((inv, index) => {
            const y = 200 + index * 140;

            const btn = this.add.text(512, y, `[ ${inv.name.toUpperCase()} ]`, {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.add.text(512, y + 35, inv.description, {
                fontFamily: 'Arial', fontSize: 14, color: '#888888',
                wordWrap: { width: 600 }, align: 'center',
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setColor('#cc0000'));
            btn.on('pointerout', () => btn.setColor('#ffffff'));
            btn.on('pointerdown', () => {
                this.scene.start('StageIntro', {
                    investigationId: index,
                    stageIndex: 0,
                });
            });
        });

        // Back
        const backBtn = this.add.text(512, 680, '[ RETOUR ]', {
            fontFamily: 'Arial', fontSize: 18, color: '#666666',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#666666'));
        backBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
