import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class FinalReveal extends Scene {
    constructor() {
        super('FinalReveal');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        const lines = [
            { text: 'Cinq enquêtes. Des dizaines de combats.', y: 100, delay: 0 },
            { text: 'Du bar miteux au Palais de Justice...', y: 150, delay: 1500 },
            { text: 'Viktor Volkov. Le Directeur. L\'Hydre.', y: 210, delay: 3000, color: '#888888' },
            { text: 'Tous n\'étaient que des pions.', y: 260, delay: 4500 },
            { text: 'Le vrai coupable...', y: 340, delay: 6000, color: '#cc0000', size: 24 },
            { text: 'LE JUGE MORTENSEN', y: 410, delay: 8000, color: '#ff0000', size: 52 },
            { text: 'Celui qui a commandité l\'assassinat de ta famille.', y: 480, delay: 10000 },
            { text: 'Il a payé de sa vie.', y: 520, delay: 11500, color: '#cc0000' },
            { text: 'Justice est rendue.', y: 590, delay: 13000, color: '#ffd700', size: 28 },
            { text: 'Repose en paix.', y: 640, delay: 15000, color: '#666666', size: 16 },
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

        this.tweens.add({ targets: btn, alpha: 1, duration: 500, delay: 17000 });

        btn.on('pointerover', () => btn.setColor('#ffffff'));
        btn.on('pointerout', () => btn.setColor('#666666'));
        btn.on('pointerdown', () => this.scene.start('MainMenu'));

        EventBus.emit('current-scene-ready', this);
    }
}
