import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // No external assets needed — textures are generated in Preloader
    }

    create() {
        this.scene.start('Preloader');
    }
}
