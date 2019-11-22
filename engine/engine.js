// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const Users = require('./users');

const TICK_RATE = 30;
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const MOVE_SPEED = 5;

const DIRECTION = Object.freeze({
    UP: Symbol("UP"),
    UP_RIGHT: Symbol("UP_RIGHT"),
    RIGHT: Symbol("RIGHT"),
    DOWN_RIGHT: Symbol("DOWN_RIGHT"),
    DOWN: Symbol("DOWN"),
    DOWN_LEFT: Symbol("DOWN_LEFT"),
    LEFT: Symbol("LEFT"),
    UP_LEFT: Symbol("UP_LEFT"),
});
const ACTION = Object.freeze({
    MOVE: Symbol("MOVE"),
});

class Engine {

    constructor() {
        this._tick_num = 0;
        this._start_time = null;

        this._timer = null;
        this._users = new Users();
    }

    get TICK_RATE() {return TICK_RATE;}
    get WORLD_WIDTH() {return WORLD_WIDTH;}
    get WORLD_HEIGHT() {return WORLD_HEIGHT;}
    get MOVE_SPEED() {return MOVE_SPEED;}
    get DIRECTION() {return DIRECTION;}


    get tick_num() {return this._tick_num;}
    get start_time() {return this._start_time;}
    get isRunning() {return !!this._timer;}

    // Starts the engine
    init() {
        let tick_repeater = () => {
            // Don't use setinterval to prevent skipping ticks.
            this._timer = setTimeout(tick_repeater, 1000/TICK_RATE);
            this.tick();
        };

        this._start_time = Date.now();
        tick_repeater();
    }

    // shuts the engine down.
    shutdown() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._start_time = null;
    }

    // moves a user in DIRECTION
    move(id, direction) {
        this._users.with(id, user => {
            user.nextActions.push({action: ACTION.MOVE, direction: direction});
        })
    }

    // creates a new user and returns its ID
    create() {
        let x = Math.random() * WORLD_WIDTH;
        let y = Math.random() * WORLD_HEIGHT;
        return this._users.add(x, y);
    }

    // returns information about a user
    info(id) {
        let user = this._users.find(id);
        if (!user) return null;
        return  {
            id: user.id,
            position: {
                x: user.x,
                y: user.y
            }
        }
    }

    // This function must be completely synchronous.
    tick() {
        this._tick_num++;
        this._users.forEach(user => {
            user.tick_reset();
            user.nextActions.forEach(action => {
                switch (action.action) {
                    case ACTION.MOVE:
                        if (!user.movedV) {
                            let amount = 0;
                            if (action.direction === DIRECTION.UP
                                || action.direction === DIRECTION.UP_RIGHT
                                || action.direction === DIRECTION.UP_LEFT) {
                                amount -= MOVE_SPEED;
                            }
                            if (action.direction === DIRECTION.DOWN
                                || action.direction === DIRECTION.DOWN_RIGHT
                                || action.direction === DIRECTION.DOWN_LEFT) {
                                amount += MOVE_SPEED;
                            }
                            if (amount !== 0) {
                                user.x += amount;
                                if (user.x > WORLD_WIDTH) user.x = WORLD_WIDTH;
                                user.movedV = true;
                            }
                        }
                        if (!user.movedH) {
                            let amount = 0;
                            if (action.direction === DIRECTION.LEFT
                                || action.direction === DIRECTION.UP_LEFT
                                || action.direction === DIRECTION.DOWN_LEFT) {
                                amount -= MOVE_SPEED;
                            }
                            if (action.direction === DIRECTION.RIGHT
                                || action.direction === DIRECTION.UP_RIGHT
                                || action.direction === DIRECTION.DOWN_RIGHT) {
                                amount += MOVE_SPEED;
                            }
                            if (amount !== 0) {
                                user.y += amount;
                                if (user.y > WORLD_WIDTH) user.y = WORLD_HEIGHT;
                                user.movedH = true;
                            }
                        }
                        break;
                    default:
                        console.log('Unknown action encountered: ', action);
                }
            });
            user.nextActions = [];
        })
    }

}

module.exports = new Engine();