import WaterBodyPlugin from 'phaser-plugin-water-body';

import * as level from './scenes/level';
import * as ui from './scenes/ui';
import * as preloader from '@/scenes/preloader';
import * as pause from '@/scenes/pause';
import NormalizedControlsPlugin from './plugins/NormalizedControls';
import MapManagerPlugin from './plugins/MapManager';
import PlatformPlugin from './plugins/Platform';

const ratioWidth = 16;
const ratioHeight = 9;
const height = level.roomHeight * level.tileSize;
const ratio = height / ratioHeight;
const width = ratio * ratioWidth;

window.onload = () => {
    const game = new Phaser.Game({
        backgroundColor: 'rgba(0, 0, 0, 0)',
        height,
        input: {
            gamepad: true
        },
        parent: 'game',
        pixelArt: true,
        scene: [
            preloader,
            level,
            ui,
            pause
        ],
        type: Phaser.AUTO,
        width,
        physics: {
            default: 'matter'
        },
        plugins: {
            global: [
                {
                    key: 'normalizedControls',
                    mapping: 'normalizedControls',
                    plugin: NormalizedControlsPlugin,
                },
                {
                    key: 'WaterBodyPlugin',
                    plugin: WaterBodyPlugin,
                    start: true
                },
                {
                    key: 'PlatformPlugin',
                    plugin: PlatformPlugin,
                    start: true,
                },
            ],
            scene: [
                {
                    key: 'mapManagerPlugin',
                    mapping: 'map',
                    plugin: MapManagerPlugin,
                },
                {
                    plugin: PhaserMatterCollisionPlugin,
                    key: 'matterCollision',
                    mapping: 'matterCollision'
                },
            ]
        }
    });
};
