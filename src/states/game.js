export const tileSize = 32;
export const roomWidth = 8;
export const roomHeight = 6;
export const numRows = 4;
export const numColumns = 4;
export const mapWidth = roomWidth * numColumns;
export const mapHeight = roomHeight * numRows;

let cursors;
let map;
let player;

export function preload () {
    this.load.image('tiles', '/src/data/tiles.png');
    this.load.image('player', '/src/data/nega_nathan.png');

    this.load.json('left', '/src/data/left.json');
    this.load.json('right', '/src/data/right.json');
    this.load.json('down', '/src/data/down.json');
}

export function create () {
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

    const layouts = {
        left: leftLayout,
        right: rightLayout,
        down: downLayout
    };
    const levelLayout = generateSolutionPath();
    const rooms = levelLayout
        .reduce((level, direction, i) => ([
            ...level,
            layouts[directionsMap[direction]].data.map(i => i - 1)
        ]), []);
    const roomGrid = buildRoomGrid({
        height: mapHeight,
        width: mapWidth,
        rooms
    });

    map = this.make.tilemap({
        data: roomGrid,
        tileWidth: tileSize,
        tileHeight: tileSize
    });
    const tileset = map.addTilesetImage('tiles');
    const layer = map.createDynamicLayer(0, tileset, 0, 0);
    const collisionMap = getCollisionMapForRoom(roomGrid);

    this.physics.world.setCollisionMap(32, collisionMap);
    this.physics.world.setBounds();

    cursors = this.input.keyboard.createCursorKeys();

    player = this.physics.add.sprite(32, 32, 'player');

    player.setActive();
    player.setBodyScale(.6, .6);
    player.setOrigin(0.5, 0);
    player.setMaxVelocity(500);
    player.setFriction(2000, 100);

    player.body.accelGround = 1000;
    player.body.accelAir = 800;
    player.body.jumpSpeed = 500;
}

export function update () {
    let acceleration = player.body.accelGround;
    if (!player.body.standing) {
        acceleration = player.body.accelAir;
    }

    if (cursors.left.isDown && cursors.right.isUp) {
        player.setAccelerationX(-acceleration);
    } else if (cursors.right.isDown && cursors.left.isUp) {
        player.setAccelerationX(acceleration);
    } else {
        player.setAccelerationX(0);
    }

    if (cursors.up.isDown && player.body.standing) {
        player.setVelocityY(-player.body.jumpSpeed);
    }
}

function getCollisionMapForRoom (rooms) {
    return rooms
        .map(room => room
            .map(space => Number(space > -1))
        );
}

function buildRoomGrid ({
    rooms = []
} = {}) {
    let data = [];

    for (let row = 0; row < numRows; row++) {
        const offset = row * numColumns;
        const roomsInRow = rooms.slice(offset, offset + numColumns);

        let rowData = [];

        for (let i = 0; i < roomHeight; i++) {
            const roomOffset = i * roomWidth;

            let t = [];

            roomsInRow.forEach(room => t.push(...room.slice(roomOffset, roomOffset + roomWidth)));
            rowData.push(t);
        }

        data.push(...rowData);
    }

    return data;
}

function generateSolutionPath () {
    Phaser.Math.RND.sow([ Date.now() ]);

    const calcHeight = mapHeight / roomHeight;
    const calcWidth = mapWidth / roomWidth;
    const startTile = Phaser.Math.RND.between(0, mapWidth - 1);
    let data = [];

    for (let row = 0; row < calcHeight; row++) {
        let rowData = [];

        for (let col = 0; col < calcWidth; col++) {
            let t = Phaser.Math.RND.pick(fillRange(0, 4));

            if (row < calcHeight - 1) {
                const position = Phaser.Math.RND.pick(fillRange(0, numColumns - 1));

                if (t > 3) {
                    rowData.splice(position, 0, 4);

                    continue;
                } else if (col === (calcWidth) - 1 && !rowData.includes(4)) {
                    rowData.splice(position, 0, 4);

                    continue;
                }
            } else if (t === 4) {
                t = Phaser.Math.RND.pick(fillRange(0, 3));
            }

            rowData.push(t);
        }

        data.push(...rowData);
    }

    return data;
}

const directionsMap = {
    0: 'left',
    1: 'left',
    2: 'right',
    3: 'right',
    4: 'down'
};

const fillRange = (start, end) =>
    Array(end - start + 1)
    .fill()
    .map((item, index) => start + index);
