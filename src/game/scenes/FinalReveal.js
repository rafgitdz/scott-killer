import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class FinalReveal extends Scene {
    constructor() {
        super('FinalReveal');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        const lines = [
            { text: 'Après toutes ces enquêtes...', y: 150, delay: 0 },
            { text: 'Tous ces indices collectés...', y: 200, delay: 1500 },
            { text: 'La vérité éclate enfin.', y: 260, delay: 3000 },
            { text: 'Le coupable est...', y: 360, delay: 5000, color: '#cc0000', size: 24 },
            { text: 'VIKTOR VOLKOV', y: 430, delay: 7000, color: '#ff0000', size: 52 },
            { text: 'Le parrain du syndicat.', y: 500, delay: 9000, color: '#cc0000', size: 18 },
            { text: "Celui qui a ordonné l'assassinat de ta famille.", y: 540, delay: 10500 },
            { text: 'La justice sera rendue.', y: 610, delay: 12000, color: '#ffd700', size: 22 },
        ];

        lines.forEach(({ text, y, delay, color, size }) => {
            const txt = this.add.text(512, y, text, {
                fontFamily: 'Arial', fontSize: `${size || 18}px`,
                color: color || '#ffffff', align: 'center',
                stroke: '#000000', strokeThickness: 3,
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({ targets: txt, alpha: 1, duration: 1000, delay });
        });

        const btn = this.add.text(512, 710, '[ MENU PRINCIPAL ]', {
            fontFamily: 'Arial', fontSize: 20, color: '#666666',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

        this.tweens.add({ targets: btn, alpha: 1, duration: 500, delay: 14000 });

        btn.on('pointerover', () => btn.setColor('#ffffff'));
        btn.on('pointerout', () => btn.setColor('#666666'));
        btn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
