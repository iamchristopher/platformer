import EnemyBase from './EnemyBase';
import ActorSprite from './ActorSprite';
import StatePatrol from './states/StatePatrol';
import {
    DAMAGE_RECEIVE,
    STATE_CHANGE
} from '@/constants/events';

const {
    Physics: {
        Matter: {
            Matter: {
                Body,
                Bodies
            }
        }
    }
} = Phaser;

export default class Enemy extends EnemyBase {

    constructor (scene, x, y) {
        super(scene, x, y);

        const sensorOptions = {
            isSensor: true
        };
        const sprite = new ActorSprite(scene.matter.world, 0, 0, 'player', 0)
            .setActor(this)
            .setDisplaySize(32, 32)
            .setSize(32, 32);
        const mainBody = Bodies.rectangle(0, 0, 16, 32, {
            chamfer: {
                radius: 4
            }
        });
        this.sensors = {
            right: Bodies.rectangle(8, 0, 2, sprite.height * 0.5, sensorOptions),
            bottom: Bodies.rectangle(0, sprite.height * 0.5, sprite.width * 0.25, 2, sensorOptions),
            left: Bodies.rectangle(-8, 0, 2, sprite.height * 0.5, sensorOptions)
        };
        const compoundBody = Body.create({
            parts: [
                mainBody,
                ...Object.values(this.sensors)
            ],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 0.05,
            render: {
                sprite: {
                    xOffset: 0,
                    yOffset: 0.1
                }
            }
        });
        this.sprite = sprite
            .setExistingBody(compoundBody)
            .setFixedRotation()
            .setPosition(x, y)
            .setTint(0xce4a4a);

        this.scene.matterCollision.addOnCollideStart({
            objectA: Object.values(this.sensors),
            callback: this.onSensorCollide,
            context: this
        });
        this.scene.matterCollision.addOnCollideActive({
            objectA: Object.values(this.sensors),
            callback: this.onSensorCollide,
            context: this
        });

        this.events.emit(STATE_CHANGE, StatePatrol);
    }

    onSensorCollide ({ bodyA, bodyB }) {
        if (bodyB.isSensor && bodyB.label.indexOf('player') !== 0) {
            return;
        }

        return super.onSensorCollide(...arguments);
    }

}
