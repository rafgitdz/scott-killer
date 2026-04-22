import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CONFIG } from '../config.js';
import { INVESTIGATIONS } from '../data/investigations.js';

export class StageComplete extends Scene {
    constructor() {
        super('StageComplete');
    }

    init(data) {
        this.investigationId = data.investigationId;
        this.stageIndex = data.stageIndex;
        this.clueText = data.clueText;
    }

    create() {
        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        const investigation = INVESTIGATIONS[this.investigationId];
        const isLastStage = this.stageIndex >= investigation.stages.length - 1;

        this.add.text(512, 120, 'ÉTAPE TERMINÉE', {
            fontFamily: 'Arial Black', fontSize: 36,
            color: '#00cc00', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(512, 220, 'INDICE TROUVÉ', {
            fontFamily: 'Arial', fontSize: 20, color: '#ffd700',
        }).setOrigin(0.5);

        // Clue text fade-in
        const clueObj = this.add.text(512, 310, `"${this.clueText}"`, {
            fontFamily: 'Arial', fontSize: 22, color: '#ffd700',
            fontStyle: 'italic', wordWrap: { width: 600 },
            align: 'center', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: clueObj, alpha: 1, duration: 1000, delay: 500 });

        // Next button
        const nextText = isLastStage ? '[ FIN DE L\'ENQUÊTE ]' : '[ ÉTAPE SUIVANTE ]';
        const nextBtn = this.add.text(512, 480, nextText, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

        this.tweens.add({ targets: nextBtn, alpha: 1, duration: 500, delay: 2000 });

        nextBtn.on('pointerover', () => nextBtn.setColor('#cc0000'));
        nextBtn.on('pointerout', () => nextBtn.setColor('#ffffff'));
        nextBtn.on('pointerdown', () => {
            if (isLastStage) {
                this.scene.start('InvestigationComplete', {
                    investigationId: this.investigationId,
                });
            } else {
                this.scene.start('StageIntro', {
                    investigationId: this.investigationId,
                    stageIndex: this.stageIndex + 1,
                });
            }
        });

        EventBus.emit('current-scene-ready', this);
    }
}
