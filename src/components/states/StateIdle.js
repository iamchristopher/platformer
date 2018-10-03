import State from './State';
import StateAttack from './StateAttack';
import StateWalk from './StateWalk';
import StateFalling from './StateFalling';
import StateJump from './StateJump';
import StateLadder from './StateLadder';
import {
    STATE_CHANGE
} from '@/constants/events';

export default class StateIdle extends State {

    execute () {
        const {
            target: {
                scene: {
                    cursors
                }
            },
            target
        } = this;

        /*
        if (this.target.vel.y > 1000) {
            return this.target.emit(STATE_CHANGE, StateFalling);
        }

        const groundTilePos = {
            x: this.target.body.pos.x + (this.target.body.size.x / 2),
            y: this.target.body.pos.y + this.target.body.size.y
        };
        const currentTileAtPosition = this.target.scene.interactions.getTileAtWorldXY(groundTilePos.x, groundTilePos.y - 1, true);
        const climbKeys = [ 'up', 'down' ];
        const climbKeysPressed = !!Object
            .keys(cursors)
            .filter(key => climbKeys.includes(key))
            .find(key => cursors[key].isDown);

        if (currentTileAtPosition.index === 11 && climbKeysPressed) {
            return this.target.emit(STATE_CHANGE, StateLadder);
        }

        if (cursors.space.isDown) {
            return this.target.emit(STATE_CHANGE, StateAttack);
        }
        */

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (target.isTouchingLadder) {
                return target.events.emit(STATE_CHANGE, StateLadder);
            }

            return target.events.emit(STATE_CHANGE, StateJump);
        }

        const movementKeys = [ 'left', 'right' ];
        const movementKeysPressed = !!Object
            .keys(cursors)
            .filter(key => movementKeys.includes(key))
            .some(key => cursors[key].isDown);

        if (movementKeysPressed) {
            return target.events.emit(STATE_CHANGE, StateWalk);
        }
    }

}
