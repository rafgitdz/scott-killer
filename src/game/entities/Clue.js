import { CONFIG } from '../config.js';

export class Clue {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'clue');
        this.sprite.body.setImmovable(true);
        this.sprite.body.setAllowGravity(false);
        this.sprite.setDepth(3);
        this.collected = false;

        // Pulsing effect
        scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.7,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Glow ring
        this.glow = scene.add.circle(x, y, 20, CONFIG.COLORS.CLUE, 0.15);
        this.glow.setDepth(2);
        scene.tweens.add({
            targets: this.glow,
            scaleX: 1.6,
            scaleY: 1.6,
            alpha: 0.03,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect() {
        if (this.collected) return;
        this.collected = true;

        this.scene.tweens.add({
            targets: [this.sprite, this.glow],
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                if (this.sprite) this.sprite.destroy();
                if (this.glow) this.glow.destroy();
            }
        });
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
        if (this.glow) this.glow.destroy();
    }
}
