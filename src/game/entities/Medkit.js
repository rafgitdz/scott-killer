import { CONFIG } from '../config.js';

export class Medkit {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'medkit');
        this.sprite.body.setImmovable(true);
        this.sprite.body.setAllowGravity(false);
        this.sprite.setDepth(3);
        this.collected = false;

        // Pulsing effect
        scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect() {
        if (this.collected) return;
        this.collected = true;
        if (this.sprite) this.sprite.destroy();
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}
