import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { GameLevel } from './scenes/GameLevel';
import { InvestigationSelect } from './scenes/InvestigationSelect';
import { StageIntro } from './scenes/StageIntro';
import { StageComplete } from './scenes/StageComplete';
import { InvestigationComplete } from './scenes/InvestigationComplete';
import { FinalReveal } from './scenes/FinalReveal';
import { AUTO, Game as PhaserGame } from 'phaser';
import { Preloader } from './scenes/Preloader';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        InvestigationSelect,
        StageIntro,
        GameLevel,
        StageComplete,
        InvestigationComplete,
        FinalReveal,
        GameOver,
    ],
};

const StartGame = (parent) => {
    return new PhaserGame({ ...config, parent });
};

export default StartGame;
