// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const TICK_RATE = 30;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 100;

class Engine {

    constructor() {
        this.timer = null;
        this.tick_num = 0;
    }

    get TICK_RATE() {return TICK_RATE;}
    // TODO(anno): figure out and document the unit of these two measures
    get WORLD_WIDTH() {return WORLD_WIDTH;}
    get WORLD_HEIGHT() {return WORLD_HEIGHT;}

    get isRunning() {return !!this.timer;}

    // Starts the engine
    init() {
        let tick_repeater = () => {
            // Don't use setinterval to prevent skipping ticks.
            this.timer = setTimeout(tick_repeater, 1000/TICK_RATE);
            this.tick();
        };
        tick_repeater();
    }

    // shuts the engine down.
    shutdown() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    // This function must be completely synchronous.
    tick() {
        this.tick_num++;
    }

}

module.exports = new Engine();