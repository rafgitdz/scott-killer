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

        this.add.text(512, 50, 'SÉLECTION D\'ENQUÊTE', {
            fontFamily: 'Arial Black', fontSize: 36,
            color: '#cc0000', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);

        INVESTIGATIONS.forEach((inv, index) => {
            const y = 150 + index * 100;
            const unlocked = index === 0 || localStorage.getItem(`scottKiller_inv${index - 1}_complete`);
            const btnColor = unlocked ? '#ffffff' : '#555555';
            const lockPrefix = unlocked ? '' : '🔒 ';

            const btn = this.add.text(512, y, `[ ${lockPrefix}${inv.name.toUpperCase()} ]`, {
                fontFamily: 'Arial', fontSize: 20, color: btnColor,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.add.text(512, y + 28, inv.description, {
                fontFamily: 'Arial', fontSize: 12, color: unlocked ? '#888888' : '#444444',
                wordWrap: { width: 600 }, align: 'center',
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setColor(unlocked ? '#cc0000' : '#777777'));
            btn.on('pointerout', () => btn.setColor(btnColor));
            btn.on('pointerdown', () => {
                if (!unlocked) {
                    const msg = this.add.text(512, y + 50, 'Termine l\'enquête précédente d\'abord', {
                        fontFamily: 'Arial', fontSize: 12, color: '#ff4444',
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => msg.destroy());
                    return;
                }
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
