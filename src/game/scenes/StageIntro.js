import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CONFIG } from '../config.js';
import { INVESTIGATIONS } from '../data/investigations.js';

export class StageIntro extends Scene {
    constructor() {
        super('StageIntro');
    }

    init(data) {
        this.investigationId = data.investigationId;
        this.stageIndex = data.stageIndex;
    }

    create() {
        this.cameras.main.setBackgroundColor(CONFIG.COLORS.BACKGROUND);

        const investigation = INVESTIGATIONS[this.investigationId];
        const stage = investigation.stages[this.stageIndex];

        // Investigation name
        this.add.text(512, 80, investigation.name, {
            fontFamily: 'Arial', fontSize: 18, color: '#666666',
        }).setOrigin(0.5);

        // Stage counter
        this.add.text(512, 130, `ÉTAPE ${this.stageIndex + 1} / ${investigation.stages.length}`, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#cc0000',
        }).setOrigin(0.5);

        // Stage name
        this.add.text(512, 200, stage.name.toUpperCase(), {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);

        // Description
        this.add.text(512, 280, stage.description, {
            fontFamily: 'Arial', fontSize: 16, color: '#aaaaaa',
            wordWrap: { width: 600 }, align: 'center',
        }).setOrigin(0.5);

        // Previous clue reminder
        if (this.stageIndex > 0) {
            const prevClue = investigation.stages[this.stageIndex - 1].clueText;
            this.add.text(512, 380, 'Dernier indice :', {
                fontFamily: 'Arial', fontSize: 14, color: '#ffd700',
            }).setOrigin(0.5);

            this.add.text(512, 410, `"${prevClue}"`, {
                fontFamily: 'Arial', fontSize: 16, color: '#ffd700',
                fontStyle: 'italic', wordWrap: { width: 500 }, align: 'center',
            }).setOrigin(0.5);
        }

        // GO button
        const goBtn = this.add.text(512, 540, '[ GO ]', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#cc0000',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: goBtn, scaleX: 1.1, scaleY: 1.1,
            duration: 600, yoyo: true, repeat: -1,
        });

        goBtn.on('pointerover', () => goBtn.setColor('#ff0000'));
        goBtn.on('pointerout', () => goBtn.setColor('#cc0000'));
        goBtn.on('pointerdown', () => {
            localStorage.setItem('scottKiller_save', JSON.stringify({
                investigationId: this.investigationId,
                stageIndex: this.stageIndex,
            }));
            this.scene.start('GameLevel', {
                investigationId: this.investigationId,
                stageIndex: this.stageIndex,
            });
        });

        // Controls hint
        this.add.text(512, 700, 'ZQSD / WASD — Déplacer  |  SOURIS — Viser  |  CLIC — Tirer', {
            fontFamily: 'Arial', fontSize: 12, color: '#444444',
        }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
    }
}
