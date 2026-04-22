import { CONFIG } from '../config.js';

export function buildLevel(scene, layout) {
    const ts = CONFIG.TILE_SIZE;
    const result = {
        walls: null,
        playerSpawn: { x: ts * 2, y: ts * 2 },
        enemySpawns: [],
        clueSpawn: { x: ts * 3, y: ts * 3 },
        width: 0,
        height: 0,
    };

    result.walls = scene.physics.add.staticGroup();

    for (let row = 0; row < layout.length; row++) {
        const line = layout[row];
        if (line.length * ts > result.width) result.width = line.length * ts;

        for (let col = 0; col < line.length; col++) {
            const ch = line[col];
            const cx = col * ts + ts / 2;
            const cy = row * ts + ts / 2;

            switch (ch) {
                case '#':
                    result.walls.create(cx, cy, 'tile-wall');
                    break;
                case 'P':
                    result.playerSpawn = { x: cx, y: cy };
                    break;
                case 'E':
                    result.enemySpawns.push({ x: cx, y: cy, type: 'grunt' });
                    break;
                case 'H':
                    result.enemySpawns.push({ x: cx, y: cy, type: 'heavy' });
                    break;
                case 'S':
                    result.enemySpawns.push({ x: cx, y: cy, type: 'sniper' });
                    break;
                case 'C':
                    result.clueSpawn = { x: cx, y: cy };
                    break;
            }
        }
    }

    result.height = layout.length * ts;
    return result;
}
