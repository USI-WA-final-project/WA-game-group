const BODYPART_TYPE =  Object.freeze({
    CELL: Symbol("CELL"),
    SPIKE: Symbol("CELL"),
    SHIELD: Symbol("CELL"),
    BOUNCE: Symbol("CELL"),
});
module.exports.BODYPART_TYPE = BODYPART_TYPE;

const MAX_HEALTH = 100;
module.exports.MAX_HEALTH = MAX_HEALTH;

const MAX_INFLATE = 100;
module.exports.MAX_INFLATE = MAX_INFLATE;

const INFLATE_RATE = 10;
module.exports.INFLATE_RATE = INFLATE_RATE;

const REGEN_RATE = 100;
module.exports.REGEN_RATE = REGEN_RATE;

const ACTION = Object.freeze({
    MOVE: Symbol("MOVE"),
    DESTROY: Symbol("DESTROY"),
});
module.exports.ACTION = ACTION;