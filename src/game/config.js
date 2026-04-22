// Game constants for Scott Killer
export const CONFIG = {
    // Display
    GAME_WIDTH: 1024,
    GAME_HEIGHT: 768,
    TILE_SIZE: 48,

    // Player
    PLAYER: {
        SPEED: 200,
        SIZE: 20,
        COLOR: 0x4a6fa5,
        MAX_HP: 100,
        FIRE_RATE: 250, // ms between shots
        INVINCIBILITY_TIME: 300, // ms after taking damage
    },

    // Bullets
    BULLET: {
        SPEED: 500,
        SIZE: 4,
        PLAYER_COLOR: 0xffcc00,
        ENEMY_COLOR: 0xff6666,
        MAX_DISTANCE: 600,
        DAMAGE: 25,
    },

    // Enemies
    ENEMY: {
        DETECTION_RANGE: 250,
        ALERT_RANGE: 200,
        ATTACK_RANGE: 300,
        FIRE_RATE: 1000, // ms
        BULLET_DAMAGE: 10,
    },

    // Visuals
    COLORS: {
        BACKGROUND: 0x0a0a0a,
        WALL: 0x2a2a2a,
        FLOOR: 0x151515,
        CLUE: 0xffd700,
        HP_FULL: 0x00cc00,
        HP_LOW: 0xcc0000,
        TEXT: 0xffffff,
        ACCENT: 0xcc0000,
        TITLE: 0xcc0000,
    },

    // Tiles (for level data)
    TILE: {
        FLOOR: 0,
        WALL: 1,
        PLAYER_SPAWN: 2,
        ENEMY_SPAWN: 3,
        CLUE_SPAWN: 4,
    },
};
