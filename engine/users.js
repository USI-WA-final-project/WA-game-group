// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const consts = require('./common_constants');
const BODYPART_TYPE = consts.BODYPART_TYPE;
const MAX_HEALTH = consts.MAX_HEALTH;
const MAX_INFLATE = consts.MAX_INFLATE;
const INFLATE_RATE = consts.INFLATE_RATE;
const REGEN_RATE = consts.REGEN_RATE;
const SPIKE_DMG = consts.SPIKE_DMG;
const ACTION = consts.ACTION;
const RESOURCE_SIZE = consts.RESOURCE_SIZE;
const MINING_RATE = consts.MINING_RATE;

const CELL_INNER_RADIUS = 28;

const CHEATS_ENABLED = consts.CHEATS_ENABLED;

class Users {
    constructor() {
        this._users = [];
        this._id = 0;
    }
    get _newId() {return this._id++};

    add(x, y, extern) {
        let new_user = new User(this._newId, x, y, extern);
        this._users.push(new_user);
        return new_user;
    }

    remove(id) {
        if (typeof(id) !== 'number') return;

        this._users = this._users.filter((user)=>{return user.id !== id});
    }

    forEach(...params) {
        // noinspection JSCheckFunctionSignatures
        this._users.forEach(...params);
    }

    with(id, cb) {
        let found = this._users.find(elem => elem && elem.id === id);
        if (found){
            cb(found);
        }
    }

    find(id) {
        let found = this._users.find(elem => elem && elem.id === id);
        if (found){
            return found;
        }
        return null;
    }
}

module.exports = Users;

class User {
    constructor(id, x, y, extern) {
        this.id = id;
        this.nextActions = [];

        this.x = x;
        this.dx = 0;
        this.y = y;
        this.dy = 0;
        // noinspection JSUnusedGlobalSymbols
        this.movedV = false;
        // noinspection JSUnusedGlobalSymbols
        this.movedH = false;

        this.extern = extern;

        this.callbacks = [];
        // this.color = Math.floor(Math.random() * 8);

        this.components = [
            {
                type: BODYPART_TYPE.CELL,
                faces: [-1, -1, -1, -1, -1, -1],
                health: MAX_HEALTH,
                coords: {up: 0, fwd: 0, bwd: 0}
            }
        ];
        this.rotation = 0;
        this.todo = [];

        this.resources = 0;
        this.kills = 0;

        if (CHEATS_ENABLED) this.cheat_seq = null;
    }

    tick_reset() {
        this.movedH = false;
        this.movedV = false;
        this.todo.forEach(fun => fun());
        this.todo = [];
    }

    tick_parts() {
        this.components.forEach(component => {
            switch (component.type) {
                case BODYPART_TYPE.BOUNCE:
                    component.inflated += INFLATE_RATE;
                    if (component.inflated >= MAX_INFLATE) {
                        component.inflated = MAX_INFLATE;
                        component.working = true;
                    }
                    break;
                case BODYPART_TYPE.CELL:
                    component.health += REGEN_RATE;
                    if (component.health >= MAX_HEALTH) {
                        component.health = MAX_HEALTH;
                    }
                    break;
                case BODYPART_TYPE.SHIELD:
                case BODYPART_TYPE.SPIKE:
                    break;
                default:
                    console.err('unknown bodypart type encountered: ', component.type);
            }
        })
    }

    register(cb) {
        this.callbacks.push(cb);
    }

    update(content) {
        this.callbacks.forEach(cb => {
            cb(content);
        })
    }

    export_components(components) {
        return components.map(cmp => {let newObj = {};
            newObj.type = cmp.type;
            if (cmp.faces) newObj.faces = cmp.faces;
            if (cmp.health) newObj.health = cmp.health;
            if (cmp.body) newObj.body = cmp.body;
            if (cmp.inflated) newObj.inflated = cmp.inflated;
            if (cmp.working) newObj.working = cmp.working;
            return newObj;
        });
    }
    export() {
        return {
            id: this.id,
            position: {
                x: this.x,
                y: this.y
            },
            // color: this.color,
            rotation: this.rotation,
            bodyparts: this.export_components(this.components),
            kills: this.kills,
            resources: this.resources,
            custom: this.extern,
            size: this.size(),
        }
    }

    act(action) {
        this.nextActions.push(action);
    }

    grow(part, face, type) {
        if (!this.components[part]) return -5;
        if (this.components[part].type !== BODYPART_TYPE.CELL) return -1;
        if (this.components[part].faces[face] !== -1) return -2;
        // -3 reserved for no such user
        let newcoords = {
            up: this.components[part].coords.up,
            fwd: this.components[part].coords.fwd,
            bwd: this.components[part].coords.bwd
        };
        if (face === 2 || face === 3) {
            newcoords.up += 1;
        }
        if (face === 5 || face === 0) {
            newcoords.up -= 1;
        }
        if (face === 0 || face === 1) {
            newcoords.fwd += 1;
        }
        if (face === 3 || face === 4) {
            newcoords.fwd -= 1;
        }
        if (face === 4 || face === 5) {
            newcoords.bwd += 1;
        }
        if (face === 1 || face === 2) {
            newcoords.bwd -= 1;
        }
        // This *should* not be possible I think. If it turns out to be expensive maybe we can remove it.
        if (this.components.find(cmp => cmp
                                              && cmp.type === BODYPART_TYPE.CELL
                                              && cmp.coords.up  === newcoords.up
                                              && cmp.coords.fwd === newcoords.fwd
                                              && cmp.coords.bwd === newcoords.bwd)) {
            return -4;
        }
        if (type === BODYPART_TYPE.CELL) {
            let space_blocked = false;
            this.components.forEach(component => {
                if (component.type !== BODYPART_TYPE.CELL) return;
                if (component.coords.up === newcoords.up - 1
                    && component.coords.fwd === newcoords.fwd + 1
                    && component.coords.bwd === newcoords.bwd) {
                    space_blocked = space_blocked || component.faces[3] !== -1;
                } else if (component.coords.up === newcoords.up
                    && component.coords.fwd === newcoords.fwd + 1
                    && component.coords.bwd === newcoords.bwd - 1) {
                    space_blocked = space_blocked || component.faces[4] !== -1;
                } else if (component.coords.up === newcoords.up + 1
                    && component.coords.fwd === newcoords.fwd
                    && component.coords.bwd === newcoords.bwd - 1) {
                    space_blocked = space_blocked || component.faces[5] !== -1;
                } else if (component.coords.up === newcoords.up + 1
                    && component.coords.fwd === newcoords.fwd - 1
                    && component.coords.bwd === newcoords.bwd) {
                    space_blocked = space_blocked || component.faces[0] !== -1;
                } else if (component.coords.up === newcoords.up
                    && component.coords.fwd === newcoords.fwd - 1
                    && component.coords.bwd === newcoords.bwd + 1) {
                    space_blocked = space_blocked || component.faces[1] !== -1;
                } else if (component.coords.up === newcoords.up - 1
                    && component.coords.fwd === newcoords.fwd
                    && component.coords.bwd === newcoords.bwd + 1) {
                    space_blocked = space_blocked || component.faces[2] !== -1;
                }
            });
            if (space_blocked) return -6;
        }

        let newComponent = {};
        let idx = this.components.push(newComponent) - 1;

        newComponent.type = type;
        // noinspection FallThroughInSwitchStatementJS
        switch (type) {
            case BODYPART_TYPE.BOUNCE:
                newComponent.inflated = MAX_INFLATE;
                newComponent.working = true;
            case BODYPART_TYPE.SPIKE:
            case BODYPART_TYPE.SHIELD:
                newComponent.body = part;
                break;
            case BODYPART_TYPE.CELL:
                newComponent.health = MAX_HEALTH;
                newComponent.faces = [-1, -1, -1, -1, -1, -1];
                newComponent.coords = newcoords;

                this.components.forEach((component, index) => {
                    if (component.type !== BODYPART_TYPE.CELL) return;
                    if (component.coords.up === newComponent.coords.up - 1
                     && component.coords.fwd === newComponent.coords.fwd + 1
                     && component.coords.bwd === newComponent.coords.bwd) {
                        newComponent.faces[0] = index;
                        component.faces[3] = idx;
                    } else if (component.coords.up === newComponent.coords.up
                            && component.coords.fwd === newComponent.coords.fwd + 1
                            && component.coords.bwd === newComponent.coords.bwd - 1) {
                        newComponent.faces[1] = index;
                        component.faces[4] = idx;
                    } else if (component.coords.up === newComponent.coords.up + 1
                            && component.coords.fwd === newComponent.coords.fwd
                            && component.coords.bwd === newComponent.coords.bwd - 1) {
                        newComponent.faces[2] = index;
                        component.faces[5] = idx;
                    } else if (component.coords.up === newComponent.coords.up + 1
                            && component.coords.fwd === newComponent.coords.fwd - 1
                            && component.coords.bwd === newComponent.coords.bwd) {
                        newComponent.faces[3] = index;
                        component.faces[0] = idx;
                    } else if (component.coords.up === newComponent.coords.up
                            && component.coords.fwd === newComponent.coords.fwd - 1
                            && component.coords.bwd === newComponent.coords.bwd + 1) {
                        newComponent.faces[4] = index;
                        component.faces[1] = idx;
                    } else if (component.coords.up === newComponent.coords.up - 1
                            && component.coords.fwd === newComponent.coords.fwd
                            && component.coords.bwd === newComponent.coords.bwd + 1) {
                        newComponent.faces[5] = index;
                        component.faces[2] = idx;
                    }
                });
                break;
            default:
                console.err('invalid bodypart type');
        }

        this.components[part].faces[face] = idx;
        return 0;
    }

    damage(part, amt) {
        let component = this.components[part];
        // noinspection FallThroughInSwitchStatementJS
        switch(component.type) {
            case BODYPART_TYPE.BOUNCE:
                if (component.working) {
                    component.inflated = 0;
                    component.working = false;
                    return false;
                    // intentional fallthrough
                }
            case BODYPART_TYPE.SPIKE:
                component = component.body;
            case BODYPART_TYPE.CELL:
                component.health -= amt;
                if (component.health <= 0) {
                    return this.shrink(part);
                }
                break;
            case BODYPART_TYPE.SHIELD:
                break;
            default:
                console.err('unknown bodypart encountered: ', component.type);
        }
        return false;
    }

    shrink(part) {
        if (part === 0) {
            this.act({action: ACTION.DESTROY});
            return true;
        }
        this.todo.push(() => {
            if (!this.components[part]) return;
            delete this.components[part];
            this.components.forEach(component => {
                if (component.type !== BODYPART_TYPE.CELL) return;
                component.faces = component.faces.map(val => {
                    if (val === part) {
                        return -1;
                    }
                    return val;
                })
            });

            this.mark(0);
            this.components.forEach((component, index) => {
                if (!component.isVisited) {
                    delete this.components[index];
                }
            });
            this.unmark(0);
        });
        return false;
    }

    clean_components() {
        let map = {};

        let cleaned = [];
        let j = 0;
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] === undefined) {
                continue;
            }
            map[i] = j;
            cleaned[j] = this.components[i];
            j++;
        }
        this.components = cleaned.map(component => {
            if (component.body) component.body = map[component.body];
            if (component.faces) component.faces = component.faces.map(part => map[part]);
            return component;
        });
    }

    mark(root = 0, cb) {
        if (this.components[root].isVisited) return;
        this.components[root].isVisited = true;
        cb ? cb(this.components[root]) : 0;
        if(!this.components[root].faces) return;

        this.components[root].faces.forEach(face => {
            if (face === -1) return;
            this.mark(face, cb);
        })
    }

    unmark (part = 0, cb) {
        if (!this.components[part].isVisited) return;
        delete this.components[part].isVisited;
        cb ? cb(this.components[part]) : 0;
        if(!this.components[part].faces) return;

        this.components[part].faces.forEach(face => {
            if (face === -1) return;
            this.unmark(face, cb);
        })
    };

    get_hitbox (user, bodypart, index) {
        let pos;
        let size;
        if (bodypart.type === BODYPART_TYPE.CELL) {
            pos = this.rel_pos(user.x, user.y, bodypart.coords.up, bodypart.coords.fwd, bodypart.coords.bwd);
            size = CELL_INNER_RADIUS;
        } else {
            let mother = user.components[bodypart.body];
            let mother_pos = this.rel_pos(user.x, user.y, mother.coords.up, mother.coords.fwd, mother.coords.bwd);
            let face = user.components[bodypart.body].faces.findIndex(part => part === index);
            if (face === -1) {
                console.err('Corrupted body: bodypart is not a child of its mother');
                pos = mother_pos;
                size = CELL_INNER_RADIUS;
            }

            let mult_x, mult_y;
            switch (face) {
                case 0:
                    mult_x = -24;
                    mult_y = -14;
                    break;
                case 1:
                    mult_x = 0;
                    mult_y = -28;
                    break;
                case 2:
                    mult_x = 24;
                    mult_y = -14;
                    break;
                case 3:
                    mult_x = 24;
                    mult_y = 14;
                    break;
                case 4:
                    mult_x = 0;
                    mult_y = 28;
                    break;
                case 5:
                    mult_x = -24;
                    mult_y = 14;
                    break;
            }

            // 1 is radius of hexagon, so distance between the center of two adjacent cells would be 2
            switch(bodypart.type) {
                case BODYPART_TYPE.BOUNCE:
                    pos = {x: mother_pos.x + (10/14) * mult_x, y: mother_pos.y + (10/14) * mult_y};
                    size = 18;
                    break;
                case BODYPART_TYPE.SHIELD:
                    pos = {x: mother_pos.x + (10/14) * mult_x, y: mother_pos.y + (10/14) * mult_y};
                    size = 18;
                    break;
                case BODYPART_TYPE.SPIKE:
                    pos = {x: mother_pos.x + 2 * mult_x, y: mother_pos.y + 2 * mult_y};
                    size = 0;
                    break;
            }
        }
        pos.x = Math.cos(user.rotation) * (pos.x - user.x) - Math.sin(user.rotation) * (pos.y - user.y) + user.x;
        pos.y = Math.sin(user.rotation) * (pos.x - user.x) + Math.cos(user.rotation) * (pos.y - user.y) + user.y;

        return {pos: pos, size: size};
    };

    collide_with_resource(res) {
        if (this.distance(this.x, this.y, res.position.x, res.position.y) > this.size + RESOURCE_SIZE) return false;

        let collides = false;
        this.components.forEach((bodypart, index) => {
            let hitbox = this.get_hitbox(this, bodypart, index);
            let other_hitbox = {pos: {x: res.position.x, y: res.position.y}, size: RESOURCE_SIZE};
            if (hitbox.size + other_hitbox.size > this.distance(hitbox.pos.x, hitbox.pos.y,
                other_hitbox.pos.x, other_hitbox.pos.y)) {
                collides = true;
                if (bodypart.type !== BODYPART_TYPE.SHIELD) {
                    this.resources += Math.min(res.amount, MINING_RATE);
                    res.amount -= MINING_RATE;
                }
            }
        });
        return collides;
    }

    collide_with_user(user) {

        if (this.distance_to_user(user) > this.size + user.size) return false;

        let collides = false;
        this.components.forEach((bodypart, index) => {
            let hitbox = this.get_hitbox(this, bodypart, index);
            user.components.forEach((other_bodypart, other_index) => {
                let other_hitbox = this.get_hitbox(user, other_bodypart, other_index);
                if (hitbox.size + other_hitbox.size > this.distance(hitbox.pos.x, hitbox.pos.y,
                                                                    other_hitbox.pos.x, other_hitbox.pos.y)) {
                    this.collide(index, user, other_index);
                    user.collide(other_index, this, index);
                    collides = true;
                }
            })
        });
        return collides;
    }

    collide(part, other, other_part) {
        if (this.components[part].type === BODYPART_TYPE.SPIKE) {
            if (other.damage(other_part, SPIKE_DMG)) {
                this.kills++;
            }
        }
        if (other.components[other_part].type === BODYPART_TYPE.SPIKE) {
            if (this.damage(part, SPIKE_DMG)) {
                other.kills++;
            }
        }
        // TODO(anno): bounce
    }

    rel_pos(x, y, up, fwd, bwd) {
        y -= fwd * 56;
        bwd += fwd;
        fwd -= fwd;

        // now up and bwd are opposites by the up+fwd+bwd=0 equality
        y -= 28 * up;
        x += 48 * up;

        return {x: x, y: y};
    }

    // Not exact but at most 24 too large (inner radius*2 - outer radius)
    get size() {
        return this.components.reduce((acc, part) => {
            if (part.type !== BODYPART_TYPE.CELL) return acc;
            let curpos = this.rel_pos(this.x, this.y, part.coords.up, part.coords.fwd, part.coords.bwd);
            let distance = this.distance(curpos.x, curpos.y, this.x, this.y);
            return distance > acc ? distance : acc;
        }, 0) + CELL_INNER_RADIUS * 2;
    }

    distance_to_user(user) {
        return this.distance(this.x, this.y, user.x, user.y);
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }
}