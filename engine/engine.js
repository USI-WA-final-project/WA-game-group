// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const Users = require('./users');
const consts = require('./common_constants');

const TICK_RATE = 30;
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;
const MOVE_SPEED = 0.5;
const MAX_MOVE_SPEED = 3;
const MOVE_SPEED_LOSS = 0.25;
const MAX_HEALTH = consts.MAX_HEALTH;
const RESOURCE_DENSITY = 8;
const NATURAL_RESOURCE_AMOUNT = 5;
const BODYPART_TYPE = consts.BODYPART_TYPE;
const BODYPART_COST = consts.BODYPART_COST;
const MAX_ROTATION_ITERATIONS = 100;

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

const STORED_BODIES_RAW = require('./stored_bodies');
// noinspection JSUnresolvedFunction
const STORED_BODIES = STORED_BODIES_RAW.map(body => {
    return body.map(part => {
        if (!part) return part;
        switch (part.type) {
            case 0:
                part.type = BODYPART_TYPE.CELL;
                break;
            case 1:
                part.type = BODYPART_TYPE.SPIKE;
                break;
            case 2:
                part.type = BODYPART_TYPE.SHIELD;
                break;
            case 3:
                part.type = BODYPART_TYPE.BOUNCE;
                break;
            default:
                console.error('Stored bodies corrupt');
        }
        return part;
    });
});
STORED_BODIES.forEach((body, idx) => {
    // technically this shouldn't work since STORED_BODIES is a const, but really it's just the array that is const,
    // not its content
    body.forEach((part, index) => {
        if (part === null) delete STORED_BODIES[idx][index];
    });
});
const CHEATS_ENABLED = consts.CHEATS_ENABLED;
const CHEATS = [{seq: [DIRECTION.UP, DIRECTION.DOWN,
                       DIRECTION.LEFT, DIRECTION.RIGHT, DIRECTION.LEFT, DIRECTION.RIGHT],
                 // shuriken
                 effect: (user) => {user.components = STORED_BODIES[1].map(part => Object.assign({}, part));}
                },
                {seq: [DIRECTION.LEFT, DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN],
                    // initial
                 effect: (user) => {user.components = STORED_BODIES[2].map(part => Object.assign({}, part))}
                },
                { // log user
                    seq: [DIRECTION.LEFT, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.UP],
                    effect: (user) => {
                        console.log(JSON.stringify(user, (k, v) => {
                            if (v === BODYPART_TYPE.CELL) return 0;
                            if (v === BODYPART_TYPE.SPIKE) return 1;
                            if (v === BODYPART_TYPE.SHIELD) return 2;
                            if (v === BODYPART_TYPE.BOUNCE) return 3;
                            return v;
                        }));
                    }
                },
                { // clean bodyparts
                    seq: [DIRECTION.LEFT, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.DOWN],
                    effect: (user) => { user.clean_components(); }
                },
                {seq: [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.UP, DIRECTION.DOWN],
                    // resources
                    effect: (user) => {user.resources += 500}
                },
                {seq: [DIRECTION.LEFT, DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.LEFT, DIRECTION.UP, DIRECTION.RIGHT],
                 // fortress
                 effect: (user) => {user.components = STORED_BODIES[0].map(part => Object.assign({}, part));}
                },
                {seq: [DIRECTION.LEFT, DIRECTION.DOWN, DIRECTION.RIGHT, DIRECTION.LEFT, DIRECTION.DOWN, DIRECTION.RIGHT],
                    // onion
                    effect: (user) => {user.components = STORED_BODIES[3].map(part => Object.assign({}, part))}
                },
                {seq: [DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT],
                    // snowflake
                    effect: (user) => {user.components = STORED_BODIES[4].map(part => Object.assign({}, part))}
                },
];
const CHEATS_MAX_SIZE = 16;

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
    /** @type {number} */
    get RESOURCE_SIZE_STEP() {return consts.RESOURCE_SIZE_STEP;}
    /** @type {number} */
    get RESOURCE_SIZE_MIN() {return consts.RESOURCE_SIZE_MIN;}
    /** @type {number} */
    get RESOURCE_SIZE_MAX() {return consts.RESOURCE_SIZE_MAX;}

    get DIRECTION() {return DIRECTION;}
    get BODYPART_TYPE() {return BODYPART_TYPE;}
    get BODYPART_COST() {return BODYPART_COST;}

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
            // user.act({action: ACTION.MOVE, direction: direction});
            if (!user.movedV) {
                if ((direction === DIRECTION.UP
                  || direction === DIRECTION.UP_RIGHT
                  || direction === DIRECTION.UP_LEFT)
                  && user.dy > MAX_MOVE_SPEED*-1) {
                    user.dy -= MOVE_SPEED;
                    user.movedV = true;
                }
                if ((direction === DIRECTION.DOWN
                    || direction === DIRECTION.DOWN_RIGHT
                    || direction === DIRECTION.DOWN_LEFT)
                    && user.dy < MAX_MOVE_SPEED) {
                    user.dy += MOVE_SPEED;
                    user.movedV = true;
                }
            }
            if (!user.movedH) {
                if ((direction === DIRECTION.LEFT
                    || direction === DIRECTION.UP_LEFT
                    || direction === DIRECTION.DOWN_LEFT)
                    && user.dx > MAX_MOVE_SPEED*-1) {
                    user.dx -= MOVE_SPEED;
                    user.movedH = true;
                }
                if ((direction === DIRECTION.RIGHT
                    || direction === DIRECTION.UP_RIGHT
                    || direction === DIRECTION.DOWN_RIGHT)
                    && user.dx < MAX_MOVE_SPEED) {
                    user.dx += MOVE_SPEED;
                    user.movedH = true;
                }
            }

            if (CHEATS_ENABLED && user.cheat_seq !== null) {
                if (user.cheat_seq[user.cheat_seq.length - 1] !== direction) user.cheat_seq.push(direction);
                if (user.cheat_seq.length > CHEATS_MAX_SIZE) {
                    user.cheat_seq = null;
                    return;
                }

                for (let cheat of CHEATS) {
                    let a = cheat.seq;
                    let b = user.cheat_seq;
                    if (a.length !== b.length) continue;
                    let same = true;
                    for (let i = 0; i < a.length; i++) {
                        if (a[i] !== b[i]) same = false;
                    }
                    if (same) {
                        cheat.effect(user);
                        user.cheat_seq = null;
                        break;
                    }
                }
            }
        })
    }

    /**
     * rotates a given user to face a given angle. Has no effect if given id is invalid
     * @param id {playerid} the id of the user to move
     * @param angle {number} the angle in radians the user should face. Must be between 0 and 2π
     */
    rotate(id, angle) {
        this._users.with(id, user => {
            // user.rotation = angle;
            let size = user.size;
            let iterations = 0;
            while (user.rotation !== angle && iterations < MAX_ROTATION_ITERATIONS) {
                let direction = angle > user.rotation ? 1 : -1;

                let delta = MOVE_SPEED / size * direction;
                let new_angle = user.rotation + delta;

                if ((angle - user.rotation) * direction > delta * direction) {
                    new_angle = angle;
                }

                user.rotation = new_angle;

                let blocked = false;
                this._users.forEach(other_user => {
                    blocked = blocked || other_user.id !== user.id && user.collide_with_user(other_user);
                });
                if (blocked) break;
                iterations++;
            }

        });
    }

    /**
     * creates a new user and returns its ID
     * @returns {player} an object representing the newly created player
     */
    create(extern) {
        let x = Math.ceil(Math.random() * WORLD_WIDTH);
        let y = Math.ceil(Math.random() * WORLD_HEIGHT);

        let usr =  this._users.add(x, y, extern);

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
        if (count > 20) console.error('no free space found');
        return usr.export();
    }

    /**
     * removes (kills) the user with the given ID. Has no effect if given id is invalid
     * @param id {playerid}
     */
    remove(id) {
        this._users.with(id, usr => {
            usr.shrink(0, res => {usr.resources += res});
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
     *                   -7 if player does not have sufficient resources to buy this bodypart.
     */
    attach(id, type, part, face) {
        let ret = -3;
        this._users.with(id, user => {
            if (CHEATS_ENABLED && type === consts.BODYPART_TYPE.CELL) user.cheat_seq = [];

            if (user.resources < BODYPART_COST[type]) {
                ret =  -7;
                return;
            }
            user.resources -= BODYPART_COST[type];
            ret = user.grow(part, face, type);
            if (ret < 0) user.resources += BODYPART_COST[type];
        });
        return ret;
    }

    /**
     * detaches the bodypart at the given index from the given user (and destroys/recycles it)
     * @param id {playerid} the id of the user to modify
     * @param part {number} the index of the bodypart to remove
     * @return -1 if user does not exist. -2 if user does not have part at index part. 0 otherwise.
     */
    detach(id, part) {
        let ret = -1;
        this._users.with(id, user => {
            ret = 0;
            if (!user.components.parts[part]) ret = -2;
            user.shrink(part, res => {user.resources += res});
        });
        return ret;
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
     * @property id {playerid} the id of this player
     * @property rotation {number} the angle in radians at which this player is rotated
     * @property bodyparts {bodypart[]} the bodyparts of this player
     * @property position {{x: number, y: number}} the coordinates of the position of this player
     * @property kills {number} the number of kills this player made.
     * @property size {number} An upper bound to the size of this player.
     *           Specifically, the radius of the circle which completely envelops the player (with a bit of give)
     * @property custom {*} A value given by the caller at creation. Usually an object containing custom fields.
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
     *        about the world. Currently an array with all the players and an array with all the resources.
     *        Callback is called every tick *before* the individual user callbacks.
     */
    register_global(cb) {
        this._callbacks.push(cb);
    }

    // This function must be completely synchronous.
    tick() {
        this._tick_num++;

        // spawn new resources
        if (this._resources.length < RESOURCE_DENSITY * WORLD_WIDTH * WORLD_HEIGHT / (1000 * 1000)) {
            this._resources.push({position: {x: Math.random() * WORLD_WIDTH, y: Math.random() * WORLD_HEIGHT},
                amount: NATURAL_RESOURCE_AMOUNT});
        }

        // tick users
        this._users.forEach(user => {
            user.tick_reset();

            user.tick_parts();

            // calculate by how much the user moves
            let mvy = user.dy * Math.sign(user.dy);
            if (mvy > MAX_MOVE_SPEED) mvy = MAX_MOVE_SPEED;
            mvy *= Math.sign(user.dy);

            let mvx = user.dx * Math.sign(user.dx);
            if (mvx > MAX_MOVE_SPEED) mvx = MAX_MOVE_SPEED;
            mvx *= Math.sign(user.dx);

            if (mvx !== 0 || mvy !== 0) {
                user.y += mvy;
                user.x += mvx;
                user.dy -= MOVE_SPEED_LOSS * Math.sign(user.dy);
                user.dx -= MOVE_SPEED_LOSS * Math.sign(user.dx);

                // collide with users
                let blocked = false;
                this._users.forEach(other_user => {
                    if (other_user.id === user.id) return;
                    let resource_processor = (res, user, part) => {
                        this._resources.push(
                            {   position: user.rel_pos(user.x, user.y, part.coords.up, part.coords.fwd, part.coords.bwd),
                                amount: res
                            });
                    };
                    if (user.collide_with_user(other_user, resource_processor)) blocked = true;
                });

                // collide with resources
                let removed_res = [];
                this._resources.forEach((resource, index) => {
                    if (user.collide_with_resource(resource)) {
                        blocked = true;
                        if (resource.amount <= 0) removed_res.push(index);
                    }
                });
                removed_res.forEach(index => {
                    this._resources.splice(index, 1);
                });

                // If the user can't move, put them back
                if (blocked) {
                    user.y -= mvy;
                    user.x -= mvx;
                }

                // Stay inside the world
                if (user.y > WORLD_WIDTH) user.y = WORLD_HEIGHT;
                if (user.y < 0) user.y = 0;
                if (user.x > WORLD_WIDTH) user.x = WORLD_WIDTH;
                if (user.x < 0) user.x = 0;
            }

            let actions = user.nextActions;
            user.nextActions = [];
            actions.forEach(action => {
                switch (action.action) {
                    case ACTION.DESTROY:
                        if (user.destroyed) return;
                        user.destroyed = true;
                        user.update(null);
                        if (user.resources > 0) {
                            this._resources.push({position: {x: user.x, y: user.y}, amount: user.resources / 2});
                        }
                        this._users.remove(user.id);
                        break;
                    default:
                        console.error('Unknown action encountered: ', action);
                }
            });

        });

        // update clients
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