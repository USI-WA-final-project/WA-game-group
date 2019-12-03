// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const Users = require('./users');
const consts = require('./common_constants');

const TICK_RATE = 30;
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;
const MOVE_SPEED = 2;
const MAX_HEALTH = consts.MAX_HEALTH;


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

class Engine {
    constructor() {
        this._tick_num = 0;
        this._start_time = null;

        this._timer = null;
        this._users = null;
        this._callbacks = [];
    }

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
        return this._users.add(x, y);
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
        });
        return ret;
    }

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


        let plrs_array = [];
        this._users.forEach(plr => {
            plrs_array.push(plr.export());
        });
        cb({
            players: plrs_array
        })
    }

    // This function must be completely synchronous.
    tick() {
        this._tick_num++;
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

            this._callbacks.forEach(cb => {
                let plrs_array = [];
                this._users.forEach(plr => {
                    plrs_array.push(plr.export());
                });
                cb({
                    players: plrs_array
                })
            });

            user.update(user.export());
        })
    }
}

module.exports = new Engine();