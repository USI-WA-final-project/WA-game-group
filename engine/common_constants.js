const BODYPART_TYPE =  Object.freeze({
    CELL: Symbol("CELL"),
    SPIKE: Symbol("CELL"),
    SHIELD: Symbol("CELL"),
    BOUNCE: Symbol("CELL"),
});
module.exports.BODYPART_TYPE = BODYPART_TYPE;

const MAX_HEALTH = 100;
module.exports.MAX_HEALTH = MAX_HEALTH;

const ACTION = Object.freeze({
    MOVE: Symbol("MOVE"),
});
module.exports.ACTION = ACTION;