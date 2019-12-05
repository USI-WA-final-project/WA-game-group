const BODYPART_TYPE =  Object.freeze({
    CELL: Symbol("CELL"),
    SPIKE: Symbol("SPIKE"),
    SHIELD: Symbol("SHIELD"),
    BOUNCE: Symbol("BOUNCE"),
});
module.exports.BODYPART_TYPE = BODYPART_TYPE;

const MAX_HEALTH = 100;
module.exports.MAX_HEALTH = MAX_HEALTH;

const MAX_INFLATE = 100;
module.exports.MAX_INFLATE = MAX_INFLATE;

const INFLATE_RATE = 2;
module.exports.INFLATE_RATE = INFLATE_RATE;

const REGEN_RATE = 1;
module.exports.REGEN_RATE = REGEN_RATE;

const SPIKE_DMG = 3;
module.exports.SPIKE_DMG = SPIKE_DMG;

const ACTION = Object.freeze({
    MOVE: Symbol("MOVE"),
    DESTROY: Symbol("DESTROY"),
    COLLIDE: Symbol("COLLIDE"),
});
module.exports.ACTION = ACTION;

const CHEATS_ENABLED = true;
module.exports.CHEATS_ENABLED = CHEATS_ENABLED;

const RESOURCE_SIZE = 16;
module.exports.RESOURCE_SIZE = RESOURCE_SIZE;

const MINING_RATE = 1;
module.exports.MINING_RATE = MINING_RATE;