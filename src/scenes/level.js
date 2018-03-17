import Map from '../components/map';
import Enemy from '../components/enemy';
import Player from '../components/Player';

export const key = 'level';

export const tileSize = 32;
export const roomWidth = 10;
export const roomHeight = 8;
export const numRows = 6;
export const numColumns = 6;
export const mapWidth = roomWidth * numColumns;
export const mapHeight = roomHeight * numRows;

let startPosition = {
    x: 0,
    y: 0
};

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

    let spawnPositions = [];
    const layouts = {
        left: this.cache.json.get('left').layers,
        right: this.cache.json.get('right').layers,
        down: this.cache.json.get('down').layers,
        start: this.cache.json.get('start').layers
    };
    const levelLayout = generatedMap.solutionPath;
    const {
        decorations,
        interactions,
        rooms
    } = levelLayout
        .reduce(({ decorations, rooms, interactions }, direction, i) => {
            const type = directionsMap[direction];
            const {
                [type]: [
                    {
                        data: layoutData = new Array(80).fill(-1)
                    } = {},
                    {
                        data: interactiveData = new Array(80).fill(-1)
                    } = {},
                    {
                        data: decorationsData = new Array(80).fill(-1)
                    } = {},
                    {
                        objects: spawns = []
                    } = {}
                ]
            } = layouts;

            const rowNum = Math.floor(i / numColumns);
            const colNum = i % numColumns;
            const width = roomWidth * tileSize;
            const height = roomHeight * tileSize;

            if (type === 'start') {
                startPosition.x = i * width + (width / 2);
            }

            if (spawns.length) {
                spawns.forEach(({ x, y }) => spawnPositions.push({
                    x: (colNum * width) + x,
                    y: (rowNum * height) + y
                }));
            }

            return {
                rooms: [
                    ...rooms,
                    layoutData.map(i => i - 1)
                ],
                interactions: [
                    ...interactions,
                    interactiveData.map(i => i - 1)
                ],
                decorations: [
                    ...decorations,
                    decorationsData.map(i => i - 1)
                ]
            }
        }, { rooms: [], interactions: [], decorations: [] });

    const map = this.make.tilemap({
        tileWidth: tileSize,
        tileHeight: tileSize,
        width: roomWidth * numColumns,
        height: roomHeight * numRows
    });
    const tileset = map.addTilesetImage('tiles');

    const setTilesFromGrid = (grid, collisions = true) => (tile, pos) => {
        const {
            [pos]: index
        } = grid;

        tile.index = index;

        if (collisions && index !== -1) {
            tile.setCollision(true, true, true, true, true);
        }
    };

    this.interactions = map.createBlankDynamicLayer('interactions', tileset);
    const interactionsGrid = generatedMap
        .buildRoomGrid(interactions)
        .reduce((room, interactions) => ([ ...room, ...interactions ]), []);
    this.interactions.forEachTile(setTilesFromGrid(interactionsGrid, false), this, undefined, undefined, undefined, undefined, { isNotEmpty: false });

    this.ground = map.createBlankDynamicLayer('ground', tileset);
    const roomGrid = generatedMap
        .buildRoomGrid(rooms)
        .reduce((room, segment) => ([ ...room, ...segment ]), []);
    this.ground.forEachTile(setTilesFromGrid(roomGrid), this, undefined, undefined, undefined, undefined, { isNotEmpty: false });

    this.impact.world.setCollisionMapFromTilemapLayer(this.ground);
    this.impact.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

    this.cursors = this.input.keyboard.createCursorKeys();

    window.players = this.add.group();
    players.add(new Player(this, startPosition.x + 32, startPosition.y + 32), true);

    this.enemies = this.add.group();
    spawnPositions
        .map(({ x, y }) => this.enemies.add(new Enemy(this, x, y), true));

    this.decorations = map.createBlankDynamicLayer('decorations', tileset);
    const decorationsGrid = generatedMap
        .buildRoomGrid(decorations)
        .reduce((room, decorations) => ([ ...room, ...decorations ]), []);
    this.decorations.forEachTile(setTilesFromGrid(decorationsGrid, false), this, undefined, undefined, undefined, undefined, { isNotEmpty: false });

    this.cameras.main
        .setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize)
        .startFollow(players.getFirstAlive());
}

export function update () {}

const directionsMap = {
    0: 'left',
    1: 'left',
    2: 'right',
    3: 'right',
    4: 'down',
    5: 'start'
};
