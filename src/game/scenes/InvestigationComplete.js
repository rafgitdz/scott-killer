import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CONFIG } from '../config.js';
import { INVESTIGATIONS } from '../data/investigations.js';

export class InvestigationComplete extends Scene {
    constructor() {
        super('InvestigationComplete');
    }

    init(data) {
        this.investigationId = data.investigationId;
    }

    create() {
        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        const investigation = INVESTIGATIONS[this.investigationId];

        this.add.text(512, 80, 'ENQUÊTE TERMINÉE', {
            fontFamily: 'Arial Black', fontSize: 42,
            color: '#cc0000', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(512, 140, investigation.name, {
            fontFamily: 'Arial', fontSize: 20, color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(512, 180, 'INDICES COLLECTÉS :', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffd700',
        }).setOrigin(0.5);

        investigation.stages.forEach((stage, i) => {
            this.add.text(512, 210 + i * 28, `${i + 1}. "${stage.clueText}"`, {
                fontFamily: 'Arial', fontSize: 11, color: '#cccccc',
                fontStyle: 'italic', wordWrap: { width: 700 }, align: 'center',
            }).setOrigin(0.5);
        });

        // Conclusion
        const conclusionY = 210 + investigation.stages.length * 28 + 30;
        this.add.text(512, conclusionY, investigation.conclusion, {
            fontFamily: 'Arial', fontSize: 18, color: '#cc0000',
            wordWrap: { width: 600 }, align: 'center',
        }).setOrigin(0.5);

        // Next action
        const allComplete = this.investigationId >= INVESTIGATIONS.length - 1;
        const btnText = allComplete ? '[ RÉVÉLATION FINALE ]' : '[ ENQUÊTE SUIVANTE ]';

        const btn = this.add.text(512, conclusionY + 80, btnText, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#cc0000'));
        btn.on('pointerout', () => btn.setColor('#ffffff'));
        btn.on('pointerdown', () => {
            if (allComplete) {
                this.scene.start('FinalReveal');
            } else {
                this.scene.start('StageIntro', {
                    investigationId: this.investigationId + 1,
                    stageIndex: 0,
                });
            }
        });

        localStorage.setItem('scottKiller_inv' + this.investigationId + '_complete', 'true');
        localStorage.removeItem('scottKiller_save');
        EventBus.emit('current-scene-ready', this);
    }
}
