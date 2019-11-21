This folder contains the game engine. Server must include engine.js. All other files, if any,
are internal to the engine and should not be used by the server.

Server must call engine.init() to start the world and engine.end() to shut it down.

Engine exposes some read-only constants:
TICK_RATE is the number of times that the engine ticks per second
WORLD_WIDTH is the width of the world
WORLD_HEIGHT is the height of the world