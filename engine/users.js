// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const consts = require('./common_constants');
const BODYPART_TYPE = consts.BODYPART_TYPE;
const MAX_HEALTH = consts.MAX_HEALTH;
const MAX_INFLATE = consts.MAX_INFLATE;
const INFLATE_RATE = consts.INFLATE_RATE;
const REGEN_RATE = consts.REGEN_RATE;
const ACTION = consts.ACTION;

class Users {
    constructor() {
        this._users = [];
        this._id = 0;
    }
    get _newId() {return this._id++};

    add(x, y) {
        let newId = this._newId;
        this._users.push(new User(
            newId,
            x, y
        ));
        return newId;
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
        let found = this._users.find(elem => elem.id === id);
        if (found){
            cb(found);
        }
    }

    find(id) {
        let found = this._users.find(elem => elem.id === id);
        if (found){
            return found;
        }
        return null;
    }
}

module.exports = Users;

class User {
    constructor(id, x, y) {
        this.id = id;
        this.nextActions = [];

        this.x = x;
        this.y = y;
        this.movedV = false;
        this.movedH = false;

        this.callbacks = [];
        this.color = Math.floor(Math.random() * 8);

        this.components = [
            {
                type: BODYPART_TYPE.CELL,
                faces: [-1, -1, -1, -1, -1, -1],
                health: MAX_HEALTH,
            },
        ];
        this.rotation = 0;
    }

    tick_reset() {
        this.movedH = false;
        this.movedV = false;
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
                    console.log('unknown bodypart type encountered')
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

    export() {
        return {
            id: this.id,
            position: {
                x: this.x,
                y: this.y
            },
            color: this.color,
            rotation: this.rotation,
            bodyparts: this.components.slice(),
        }
    }

    act(action) {
        this.nextActions.push(action);
    }

    grow(part, face, type) {
        if (this.components[part].type !== BODYPART_TYPE.CELL) return -1;
        if (this.components[part].faces[face] !== -1) return -2;

        let newComponent = {};
        let idx = this.components.push(newComponent) - 1;

        newComponent.type = type;
        // noinspection FallThroughInSwitchStatementJS
        switch (type) {
            case BODYPART_TYPE.BOUNCE:
                newComponent.inflated = MAX_INFLATE;
                newComponent.working = true;
            case BODYPART_TYPE.SPIKE:
                newComponent.body = part;
                break;
            case BODYPART_TYPE.CELL:
                newComponent.health = MAX_HEALTH;
                newComponent.faces = [-1, -1, -1, -1, -1, -1];

                let connect = (part, root_face, dist, angle) => {
                    this.components[part].isVisited = true;
                    if (angle < 0) angle += 6 * dist;
                    let isAxle = angle % dist === 0;

                    let adj_dist = [99, 99, 99, 99, 99, 99];
                    let adj_angle = [99, 99, 99, 99, 99, 99];
                    if (isAxle) {
                        adj_dist[(root_face + 0) % 6] = dist - 1;
                        adj_dist[(root_face + 1) % 6] = dist;
                        adj_dist[(root_face + 2) % 6] = dist + 1;
                        adj_dist[(root_face + 3) % 6] = dist + 1;
                        adj_dist[(root_face + 4) % 6] = dist + 1;
                        adj_dist[(root_face + 5) % 6] = dist;

                        adj_angle[(root_face + 0) % 6] = angle * (dist-1) / dist;
                        adj_angle[(root_face + 1) % 6] = angle - 1;
                        adj_angle[(root_face + 2) % 6] = angle * (dist + 1) / dist - 1;
                        adj_angle[(root_face + 3) % 6] = angle * (dist + 1) / dist;
                        adj_angle[(root_face + 4) % 6] = angle * (dist + 1) / dist + 1;
                        adj_angle[(root_face + 5) % 6] = angle + 1;

                    } else {
                        adj_dist[(root_face + 0) % 6] = dist - 1;
                        adj_dist[(root_face + 1) % 6] = dist;
                        adj_dist[(root_face + 2) % 6] = dist + 1;
                        adj_dist[(root_face + 3) % 6] = dist + 1;
                        adj_dist[(root_face + 4) % 6] = dist;
                        adj_dist[(root_face + 5) % 6] = dist - 1;

                        adj_angle[(root_face + 0) % 6] = (angle - (angle%dist)) * (dist-1) / dist + (angle % dist) - 1;
                        adj_angle[(root_face + 1) % 6] = angle - 1;
                        adj_angle[(root_face + 2) % 6] = (angle - (angle%dist)) * (dist+1) / dist + (angle % dist);
                        adj_angle[(root_face + 3) % 6] = (angle - (angle%dist)) * (dist+1) / dist + (angle % dist) + 1;
                        adj_angle[(root_face + 4) % 6] = angle + 1;
                        adj_angle[(root_face + 5) % 6] = (angle - (angle%dist)) * (dist-1) / dist + (angle % dist);
                    }
                    for (let i = 0; i < 6; ++i) {
                        if (adj_dist[i] === 0) {
                            this.components[part].faces[i] = idx;
                            // only the first layer can do this
                            newComponent.faces[angle] = part;
                            continue;
                        }
                        if (this.components[part].faces[i] === -1) continue;
                        let other_part = this.components[this.components[part].faces[i]];
                        if (other_part.type !== BODYPART_TYPE.CELL) continue;
                        if (other_part.isVisited) continue;

                        let rel_face = other_part.faces.findIndex(part);
                        if (rel_face === -1) {console.log('impossible body graph'); continue;}

                        let rel_root_face_diff;
                        if (isAxle) {
                            if ((i + 6 - root_face) % 6 === 0) {
                                rel_root_face_diff = 3;
                            } else if ((i + 6 - root_face) % 6 === 1) {
                                rel_root_face_diff = dist === 1 ? 1 : 2;
                            } else if ((i + 6 - root_face) % 6 === 2) {
                                rel_root_face_diff = 1;
                            } else if ((i + 6 - root_face) % 6 === 3) {
                                rel_root_face_diff = 0;
                            } else if ((i + 6 - root_face) % 6 === 4) {
                                rel_root_face_diff = 0;
                            } else if ((i + 6 - root_face) % 6 === 5) {
                                rel_root_face_diff = 5;
                            }
                        } else {
                            if (!adj_angle[i] % adj_dist[i] === 0) {
                                if ((i + 6 - root_face) % 6 === 0) {
                                    rel_root_face_diff = 2;
                                } else if ((i + 6 - root_face) % 6 === 1) {
                                    rel_root_face_diff = 1;
                                } else if ((i + 6 - root_face) % 6 === 2) {
                                    console.log('The universe broke');
                                    rel_root_face_diff = 1; // IMPOSSIBLE
                                } else if ((i + 6 - root_face) % 6 === 3) {
                                    console.log('The universe broke');
                                    rel_root_face_diff = 0; // IMPOSSIBLE
                                } else if ((i + 6 - root_face) % 6 === 4) {
                                    rel_root_face_diff = 5;
                                } else if ((i + 6 - root_face) % 6 === 5) {
                                    rel_root_face_diff = 4;
                                }
                            } else {
                                if ((i + 6 - root_face) % 6 === 0) {
                                    rel_root_face_diff = 3;
                                } else if ((i + 6 - root_face) % 6 === 1) {
                                    rel_root_face_diff = 2;
                                } else if ((i + 6 - root_face) % 6 === 2) {
                                    rel_root_face_diff = 1;
                                } else if ((i + 6 - root_face) % 6 === 3) {
                                    rel_root_face_diff = 0;
                                } else if ((i + 6 - root_face) % 6 === 4) {
                                    rel_root_face_diff = 5;
                                } else if ((i + 6 - root_face) % 6 === 5) {
                                    rel_root_face_diff = 4;
                                }
                            }
                        }

                        connect(this.components[part].faces[i],
                            (rel_face + rel_root_face_diff) % 6,
                            adj_dist[i], adj_angle[i]);
                    }
                };
                let unmark = (part) => {
                    if (!this.components[part].isVisited) return;
                    delete this.components[part].isVisited;
                    if(!this.components[part].faces) return;

                    this.components[part].faces.forEach(face => {
                        if (face === -1) return;
                        if(this.components[face].isVisited) {
                            unmark(face);
                        }
                    })
                };

                connect(part, face, 1, 6);
                unmark(part);

                break;
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
                    break;
                }
            case BODYPART_TYPE.SPIKE:
                component = component.body;
            case BODYPART_TYPE.CELL:
                component.health -= amt;
                if (component.health <= 0) {
                    this.shrink(part);
                }
                break;
            case BODYPART_TYPE.SHIELD:
                break;
            default:
                console.log('unknown bodypart encountered: ', component.type);
        }
    }

    shrink(part) {
        if (part === 0) {
            this.act({action: ACTION.DESTROY});
            return;
        }
        delete this.components[part];
        this.components.forEach(component => {
            component.faces.map(val => {
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
        this.mark(0, true);
    }

    mark(root = 0, unmark = false) {
        if (!unmark) {
            this.components[root].isVisited = true;
        } else {
            delete this.components[root].isVisited;
        }
        if(!this.components[root].faces) return;

        this.components[root].faces.forEach(face => {
            if (face === -1) return;
            if(!this.components[face].isVisited ^ unmark) {
                this.mark(face, unmark);
            }
        })
    }
}