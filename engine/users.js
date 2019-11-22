// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

class Users {
    constructor() {
        this._users = [];
        this._id = 0;
    }
    get _newId() {return this._id++};

    add(x, y) {
        let newId = this._newId();
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
            cb(found)();
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
    }

    tick_reset() {
        this.movedH = false;
        this.movedV = false;
    }
}