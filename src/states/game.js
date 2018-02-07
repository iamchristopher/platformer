import Map from '../components/map';
import Enemy from '../components/enemy';
import Player from '../components/Player';

export const tileSize = 32;
export const roomWidth = 8;
export const roomHeight = 6;
export const numRows = 10;
export const numColumns = 10;
export const mapWidth = roomWidth * numColumns;
export const mapHeight = roomHeight * numRows;

const cameraHeight = 240;
const cameraWidth = 320;

let map;
let startPosition = {
    x: 0,
    y: 0
};

export function preload () {
    this.load.image('tiles', '/src/data/tiles.png');
    this.load.image('player', '/src/data/nega_nathan.png');
    this.load.spritesheet('enemyWalk', '/src/data/enemy/walk.png', { frameWidth: 22, frameHeight: 33, endFrame: 12 });
    this.load.spritesheet('enemyAttack', '/src/data/enemy/attack.png', { frameWidth: 43, frameHeight: 37, endFrame: 18 });
    this.load.spritesheet('enemyIdle', '/src/data/enemy/idle.png', { frameWidth: 24, frameHeight: 32, endFrame: 10 });
    this.load.spritesheet('enemyHit', '/src/data/enemy/hit.png', { frameWidth: 30, frameHeight: 32, endFrame: 9 });

    this.load.json('left', '/src/data/left.json');
    this.load.json('right', '/src/data/right.json');
    this.load.json('down', '/src/data/down.json');
    this.load.json('start', '/src/data/start.json');
}

export function create () {
    this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNumbers('enemyWalk', {
            start: 0,
            end: 12,
            first: 0
        }),
        frameRate: 30,
        repeat: -1,
        repeatDelay: 0
    });
    this.anims.create({
        key: 'enemyIdle',
        frames: this.anims.generateFrameNumbers('enemyIdle', {
            start: 0,
            end: 9,
            first: 0
        }),
        frameRate: 6,
        repeat: -1,
        repeatDelay: 0
    });

    const generatedMap = new Map({
        size: {
            columns: numColumns,
            rows: numRows
        },
        room: {
            height: roomHeight,
            width: roomWidth
        }
    });

    const {
        layers: [
            leftLayout
        ]
    } = this.cache.json.get('left');
    const {
        layers: [
            rightLayout
        ]
    } = this.cache.json.get('right');
    const {
        layers: [
            downLayout
        ]
    } = this.cache.json.get('down');
    const {
        layers: [
            startLayout
        ]
    } = this.cache.json.get('start');

    const layouts = {
        left: leftLayout,
        right: rightLayout,
        down: downLayout,
        start: startLayout
    };
    const levelLayout = generatedMap.solutionPath;
    const rooms = levelLayout
        .reduce((level, direction, i) => {
            if (direction === 5) {
                const roomSize = roomWidth * tileSize;
                startPosition.x = i * roomSize + (roomSize / 2);
            }

            return [
                ...level,
                layouts[directionsMap[direction]].data.map(i => i - 1)
            ]
        }, []);
    const roomGrid = generatedMap.buildRoomGrid(rooms);

    map = this.make.tilemap({
        data: roomGrid,
        tileWidth: tileSize,
        tileHeight: tileSize
    });
    const tileset = map.addTilesetImage('tiles');
    const layer = map.createDynamicLayer(0, tileset, 0, 0);
    this.map = layer;
    const collisionMap = generatedMap.getCollisionMap(roomGrid);

    this.impact.world.setCollisionMap(collisionMap, 32);
    this.impact.world.setBounds();

    this.cursors = this.input.keyboard.createCursorKeys();

    window.players = this.add.group();
    players.add(new Player(this, startPosition.x + 32, startPosition.y + 32), true);

    this.enemies = this.add.group();
    [{ x: 100, y: 50 }]
        .map(({ x, y }) => this.enemies.add(new Enemy(this, x, y), true));

    this.cameras.main.setSize(cameraWidth, cameraHeight);
    this.cameras.main.startFollow(players.getFirstAlive());
}

export function update () {
    players.children.each(player => player.update());
    this.enemies.children.each(enemy => enemy.update());

    // checkForFallDamage.apply(this);
}

function checkForFallDamage () {
    if (player.vel.y > 1000) {
        player.body.isFalling = true;
    } else if (player.body.isFalling && player.body.standing) {
        player.body.isFalling = false;
    }
}

const directionsMap = {
    0: 'left',
    1: 'left',
    2: 'right',
    3: 'right',
    4: 'down',
    5: 'start'
};
