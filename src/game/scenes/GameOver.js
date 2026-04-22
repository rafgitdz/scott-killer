import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.investigationId = data?.investigationId ?? 0;
        this.stageIndex = data?.stageIndex ?? 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0a0000);
        this.cameras.main.fadeIn(300, 0, 0, 0);

        this.add.text(512, 250, 'TU ES MORT', {
            fontFamily: 'Arial Black', fontSize: 64,
            color: '#cc0000', stroke: '#000000', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(512, 340, 'La justice devra attendre...', {
            fontFamily: 'Arial', fontSize: 18, color: '#888888',
        }).setOrigin(0.5);

        // Retry
        const retryBtn = this.add.text(512, 460, '[ RÉESSAYER ]', {
            fontFamily: 'Arial', fontSize: 28, color: '#ffffff',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => retryBtn.setColor('#cc0000'));
        retryBtn.on('pointerout', () => retryBtn.setColor('#ffffff'));
        retryBtn.on('pointerdown', () => {
            this.scene.start('GameLevel', {
                investigationId: this.investigationId,
                stageIndex: this.stageIndex,
            });
        });

        // Menu
        const menuBtn = this.add.text(512, 530, '[ MENU PRINCIPAL ]', {
            fontFamily: 'Arial', fontSize: 20, color: '#666666',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
        menuBtn.on('pointerout', () => menuBtn.setColor('#666666'));
        menuBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
