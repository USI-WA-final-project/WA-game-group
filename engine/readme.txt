This folder contains the game engine. Server must include engine.js. All other files, if any,
are internal to the engine and should not be used by the server.

Server must call Engine.init() to start the world and Engine.shutdown() to shut it down.

Engine exposes some read-only constants:
- TICK_RATE is the number of times that the engine ticks per second
- WORLD_WIDTH is the width of the world
- WORLD_HEIGHT is the height of the world
- DIRECTION is an enum of directions.
  It contains all 8 cardinal directions in the format VERTICAL | HORIZONTAL | VERTICAL_HORIZONTAL
  where VERTICAL is one of [UP, DOWN] and HORIZONTAL is one of [RIGHT, LEFT]. e.g. DIRECTION.UP_RIGHT or DIRECTION.LEFT
- MOVE_SPEED is the speed at which players move

Engine exposes some read-only metadata:
- isRunning is true iff the engine is currently running
- tick_num is the sequential number of the current tick.
- start_time is the timestamp at which the engine was started. This can be used together with tick_num to
  figure out how much the engine has been delayed compared to the optimal frequency of TICK_RATE Hz

Engine exposes an API composed of the following functions:
- move(id: id, direction: DIRECTION) given a user id and a DIRECTION, registers that this player moved towards DIRECTION
  in the current tick. Attempts to move an id that does not exist (or does not exist anymore) will be ignored.
  direction must be one of the DIRECTION constants.
  When multiple moves are issued during the same tick, the result is undefined. It is, however, guaranteed that they
  will not move by more than MOVE_SPEED in any direction per tick.
- create() creates a new player at random coordinates and returns their ID.
- info(id: id) given a user id returns an object representing that player. If id is not a valid user id, returns null.
  returned object has the following structure:
    .id: id, user id of the player.
    .position.x: number, x coordinate of the player's position
    .position.y: number, y coordinate of the player's position
  Note that this structure is both incomplete and non-final. I reserve the right to change it at any time (that said,
  I'll try to keep existing fields close to these, and I'll never remove information completely)
- register(id: id, callback: function) given a user id and a callback function, registers the callback so that it will be called
  every tick, given as parameter the object representation of the player with the given user id.
  Has no effect if user id does not exist.
  When a player dies, all callbacks are unregistered. The last call to each callback will be passed null instead of
  a player object

All other fields, properties or functions which the class may or may not have are internal and may not be
read or modified by the server.


The engine's internal representation of the map uses cardinal coordinates with the orgin at the top left.
Any coordinates that may or may not be exposed by the engine are to be assumed in this format.