// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const Users = require('./users');
const consts = require('./common_constants');

const TICK_RATE = 30;
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const MOVE_SPEED = 2;
const MAX_HEALTH = consts.MAX_HEALTH;
const RESOURCE_DENSITY = 10;

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
const ACTION = consts.ACTION;

const CHEATS_ENABLED = consts.CHEATS_ENABLED;
const CHEATS = [{seq: [DIRECTION.UP, DIRECTION.UP, DIRECTION.DOWN, DIRECTION.DOWN,
                       DIRECTION.LEFT, DIRECTION.RIGHT, DIRECTION.LEFT, DIRECTION.RIGHT],
                 effect: (user) => {
                     // console.log(user.components);
                     user.components = [
                         { type: consts.BODYPART_TYPE.CELL,
                             faces: [ 3, 4, 5, 6, 1, 2 ],
                             health: 100,
                             coords: { up: 0, fwd: 0, bwd: 0 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 2, 0, 6, 18, 10, 19 ],
                             coords: { up: 0, fwd: -1, bwd: 1 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 21, 3, 0, 1, 20, 9 ],
                             coords: { up: -1, fwd: 0, bwd: 1 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 8, 23, 4, 0, 2, 22 ],
                             coords: { up: -1, fwd: 1, bwd: 0 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 24, 7, 13, 5, 0, 3 ],
                             coords: { up: 0, fwd: 1, bwd: -1 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 4, 14, 12, 15, 6, 0 ],
                             coords: { up: 1, fwd: 0, bwd: -1 } },
                         { type: consts.BODYPART_TYPE.CELL,
                             health: 100,
                             faces: [ 0, 5, 16, 11, 17, 1 ],
                             coords: { up: 1, fwd: -1, bwd: 0 } },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 4 },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 3 },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 2 },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 1 },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 6 },
                         { type: consts.BODYPART_TYPE.SPIKE, body: 5 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 4 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 5 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 5 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 6 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 6 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 1 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 1 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 2 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 2 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 3 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 3 },
                         { type: consts.BODYPART_TYPE.SHIELD, body: 4 },
                     ]
                 }
                },
                {seq: [DIRECTION.LEFT, DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN],
                 effect: (user) => {user.components = {
                        type: BODYPART_TYPE.CELL,
                        faces: [-1, -1, -1, -1, -1, -1],
                        health: MAX_HEALTH,
                        coords: {up: 0, fwd: 0, bwd: 0}
                     }}
                }
];

class Engine {
    constructor() {
        this._tick_num = 0;
        this._start_time = null;

        this._timer = null;
        this._users = null;
        this._resources = null;
        this._callbacks = [];
    }

    /**
     * A piece of resources.
     * @typedef resource
     * @property position {{x: number, y: number}} the position of this resource
     * @property amount {number} the number of resources held in this piece.
     */

    /** @type {number} */
    get TICK_RATE() {return TICK_RATE;}
    /** @type {number} */
    get WORLD_WIDTH() {return WORLD_WIDTH;}
    /** @type {number} */
    get WORLD_HEIGHT() {return WORLD_HEIGHT;}
    /** @type {number} */
    get MOVE_SPEED() {return MOVE_SPEED;}
    /** @type {number} */
    get MAX_HEALTH() {return MAX_HEALTH;}
    /** The amount of resources that should be found, on average, per 1000 map units^2
     *  @type {number} */
    get RESOURCE_DENSITY() {return RESOURCE_DENSITY;}

    get DIRECTION() {return DIRECTION;}
    get BODYPART_TYPE() {return consts.BODYPART_TYPE;}

    /** @type {number} */
    get tick_num() {return this._tick_num;}
    /** @type {number} */
    get start_time() {return this._start_time;}
    /** @type {boolean} */
    get isRunning() {return !!this._timer;}

    /**
     * starts the engine. May not be called again while engine is still running.
     */
    init() {
        let tick_repeater = () => {
            // Don't use setinterval to prevent skipping ticks.
            this._timer = setTimeout(tick_repeater, 1000/TICK_RATE);
            this.tick();
        };

        this._users = new Users();
        this._resources = [];
        this._tick_num = 0;
        this._start_time = Date.now();
        tick_repeater();
    }

    /**
     * shuts the engine down. May not be called while the engine is not running
     */
    shutdown() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._start_time = null;
        this._callbacks = [];
        this._users = null;
        this._resources = null;
    }

    /**
     * @typedef {number} playerid
     */

    /**
     * moves a given user into a given direction. Has no effect if given id is invalid
     * @param id {playerid} the id of the user to move
     * @param direction {DIRECTION} the direction to move the user towards
     */
    move(id, direction) {
        this._users.with(id, user => {
            user.act({action: ACTION.MOVE, direction: direction});

            if (CHEATS_ENABLED) {
                if (user.cheat_seq === 0) {
                    CHEATS.forEach((cheat, index) => {
                        if (cheat.seq[0] === direction) {
                            user.cheat = index;
                            user.cheat_seq = 1;
                        }
                    });
                    if (user.cheat === -1) user.cheat_seq = -1;
                    return;
                }

                if (user.cheat_seq > 0){
                    if (direction === CHEATS[user.cheat].seq[user.cheat_seq]) {
                        user.cheat_seq++;
                    } else if (direction !== CHEATS[user.cheat].seq[user.cheat_seq - 1]) {
                        user.cheat_seq = -1;
                        user.cheat = -1;
                    }
                }

                if (user.cheat_seq > 0 && CHEATS[user.cheat].seq.length === user.cheat_seq) {
                    CHEATS[user.cheat].effect(user);
                    user.cheat_seq = -1;
                    user.cheat = -1;
                }
            }
        })
    }

    /**
     * rotates a given user to face a given angle. Has no effect if given id is invalid
     * @param id {playerid} the id of the user to move
     * @param angle {number} the angle in radiance the user should face
     */
    rotate(id, angle) {
        this._users.with(id, user => {
            user.rotation = angle;
        })
    }

    /**
     * creates a new user and returns its ID
     * @returns {playerid} the id of the new user
     */
    create() {
        let x = Math.ceil(Math.random() * WORLD_WIDTH);
        let y = Math.ceil(Math.random() * WORLD_HEIGHT);

        let id =  this._users.add(x, y);
        let usr = this._users.find(id);

        let ok = true;
        let count = 0;
        do {
            ok = true;
            this._users.forEach(user => {
                if (user.id !== usr.id && usr.distance_to_user(user) < usr.size + user.size) {
                    ok = false;
                }
            });
            if (!ok) {
                usr.x = Math.ceil(Math.random() * WORLD_WIDTH);
                usr.y = Math.ceil(Math.random() * WORLD_HEIGHT);
            }
            count++;
        } while (!ok && count < 20);
        if (count > 20) console.log('no free space found');
        return id;
    }

    /**
     * removes (kills) the user with the given ID. Has no effect if given id is invalid
     * @param id
     */
    remove(id) {
        this._users.with(id, usr => {
            usr.act({action: ACTION.DESTROY})
        })
    }

    /**
     * attaches a new bodypart of the given type to the given user by adding it to the given face of the given bodypart
     * @param id {playerid} the id of the user to modify
     * @param type {BODYPART_TYPE} the type of the bodypart to add
     * @param part {number} the index of the bodypart to add the new part to
     * @param face {number} the face on the bodypart to add the new part to
     * @returns {number} -3 if user does not exist, -2 if face is occupied, -1 if bodypart[part] is not of type CELL,
     *                   -4 if space is already occupied by another CELL (this should actually be impossible),
     *                   -5 if part is not a valid bodypart index,
     *                   -6 if space is occupied by a SHIELD, SPIKE or BOUNCE
     */
    attach(id, type, part, face) {
        let ret = -3;
        this._users.with(id, user => {
            ret = user.grow(part, face, type);
            if (CHEATS_ENABLED && type === consts.BODYPART_TYPE.CELL && user.cheat_seq === -1) user.cheat_seq = 0;
            if (CHEATS_ENABLED && type !== consts.BODYPART_TYPE.CELL) user.cheat_seq = -1;
        });
        return ret;
    }

    /**
     * attaches the bodypart at the given index from the given user (and destroys/recycles it)
     * @param id {playerid} the id of the user to modify
     * @param part {number} the index of the bodypart to remove
     */
    detach(id, part) {
        this._users.with(id, user => {
            user.shrink(part);
        })
    }

    /**
     * A bodypart of type {@link BODYPART_TYPE.CELL}
     * @typedef {Object} cell
     * @property type {BODYPART_TYPE.CELL} the type of this bodypart
     * @property faces {number[]} the faces of this cell. Each face contains the index of the bodypart connected to it
     *                            or -1 if it is empty
     * @property health {number} the current health of this cell.
     */
    /**
     * A bodypart of type {@link BODYPART_TYPE.SPIKE}
     * @typedef {Object} spike
     * @property type {BODYPART_TYPE.SPIKE} the type of this bodypart
     * @property body {number} the index of the {@link cell} that this spike is connected to
     */
    /**
     * A bodypart of type {@link BODYPART_TYPE.BOUNCE}
     * @typedef {Object} bounce
     * @property type {BODYPART_TYPE.BOUNCE} the type of this bodypart
     * @property body {number} the index of the {@link cell} that this bounce is connected to
     * @property inflated {number} the degree to which this bounce is inflated
     * @property working {boolean} whether this bounce is working or not (pierced/damaged)
     */
    /**
     * A bodypart of type {@link BODYPART_TYPE.SHIELD}
     * @typedef {Object} shield
     * @property type {BODYPART_TYPE.SHIELD} the type of this bodypart
     * @property body {number} the index of the {@link cell} that this shield is connected to
     */

    /**
     * A bodypart
     * @typedef {cell | spike | bounce | shield} bodypart
     */

    /**
     * A player
     * @typedef {Object} player
     * @property color {number} the color of this player (0-8)
     * @property rotation {number} the angle in radians at which this player is rotated
     * @property bodyparts {bodypart[]} the bodyparts of this player
     * @property id {playerid} the id of this player
     * @property position {{x: number, y: number}} the coordinates of the position of this player
     */

    /**
     * returns information about a user
     * @param id {playerid} the id of the user to retrieve information of
     * @returns {player | null} an object representing the requested player or null if no user exists with that id
     */
    info(id) {
        let user = this._users.find(id);
        if (!user) return null;
        return user.export();
    }

    /**
     * Registers a callback for subscription to the user with the given id
     * @param id {playerid} the id of the user to register for
     * @param cb {function(player | null)} the callback that will be called every tick with the subscribed-to player or
     *                                     null if that user has been destroyed.
     */
    register(id, cb) {
        this._users.with(id, usr => {
            usr.register(cb);
        })
    }

    /**
     * Registers a callback for subscription to the world
     * @param cb {function({players: player[]})} the callback that will be called every tick with information
     *                                           about the world. Currently only an array with all the players.
     */
    register_global(cb) {
        this._callbacks.push(cb);
    }

    // This function must be completely synchronous.
    tick() {
        this._tick_num++;

        if (this._resources.length < RESOURCE_DENSITY * WORLD_WIDTH * WORLD_HEIGHT / 1000000) {
            this._resources.push({position: {x: Math.random() * WORLD_WIDTH, y: Math.random() * WORLD_HEIGHT},
                amount: 5});
        }

        this._users.forEach(user => {
            user.tick_reset();

            user.tick_parts();

            let actions = user.nextActions;
            user.nextActions = [];
            actions.forEach(action => {
                switch (action.action) {
                    case ACTION.MOVE:
                        let mvy = 0;
                        let mvx = 0;
                        if (!user.movedV) {
                            if (action.direction === DIRECTION.UP
                                || action.direction === DIRECTION.UP_RIGHT
                                || action.direction === DIRECTION.UP_LEFT) {
                                mvy -= MOVE_SPEED;
                            }
                            if (action.direction === DIRECTION.DOWN
                                || action.direction === DIRECTION.DOWN_RIGHT
                                || action.direction === DIRECTION.DOWN_LEFT) {
                                mvy += MOVE_SPEED;
                            }
                        }
                        if (!user.movedH) {
                            if (action.direction === DIRECTION.LEFT
                                || action.direction === DIRECTION.UP_LEFT
                                || action.direction === DIRECTION.DOWN_LEFT) {
                                mvx -= MOVE_SPEED;
                            }
                            if (action.direction === DIRECTION.RIGHT
                                || action.direction === DIRECTION.UP_RIGHT
                                || action.direction === DIRECTION.DOWN_RIGHT) {
                                mvx += MOVE_SPEED;
                            }
                        }
                        if (mvx === 0 && mvy === 0) break;
                        user.y += mvy;
                        if (user.y > WORLD_WIDTH) user.y = WORLD_HEIGHT;
                        if (user.y < 0) user.y = 0;
                        user.x += mvx;
                        if (user.x > WORLD_WIDTH) user.x = WORLD_WIDTH;
                        if (user.x < 0) user.x = 0;
                        let blocked = false;
                        this._users.forEach(other_user => {
                            blocked = blocked || other_user.id !== user.id && user.collide_with_user(other_user);
                        });
                        if (blocked) {user.y -= mvy; user.x -= mvx;}
                        if (mvy !== 0) {
                            user.movedV = true;
                        }
                        if (mvx !== 0) {
                            user.movedH = true;
                        }
                        break;
                    case ACTION.DESTROY:
                        user.update(null);
                        this._users.remove(user.id);
                        break;
                    default:
                        console.log('Unknown action encountered: ', action);
                }
            });

        });

        this._callbacks.forEach(cb => {
            let plrs_array = [];
            this._users.forEach(plr => {
                plrs_array.push(plr.export());
            });
            cb({
                players: plrs_array,
                resources: this._resources.slice()
            });
        });

        this._users.forEach(user => {
            user.update(user.export());
        })

    }
}

module.exports = new Engine();