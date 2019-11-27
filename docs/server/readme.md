Server must call `Engine.init()` to start the world and `Engine.shutdown()` to shut it down.
Invoking any other method before `.init()` or after `.shutdown()` is undefined behavior.

Engine exposes some read-only constants:
- `TICK_RATE` is the number of times that the engine ticks per second
- `WORLD_WIDTH` is the width of the world
- `WORLD_HEIGHT` is the height of the world
- `DIRECTION` is an enum of directions.
  It contains all 8 cardinal directions in the format `VERTICAL` | `HORIZONTAL` | `VERTICAL_HORIZONTAL`
  where `VERTICAL` is one of [`UP`, `DOWN`] and `HORIZONTAL` is one of [`RIGHT`, `LEFT`]. e.g. `DIRECTION.UP_RIGHT` or `DIRECTION.LEFT`
- `BODYPART_TYPE` is an enum of bodypart types:
  - `CELL`
  - `SPIKE`
  - `SHIELD`
  - `BOUNCE`
- `MOVE_SPEED` is the speed at which players move

Engine exposes some read-only metadata:
- `isRunning` is true iff the engine is currently running
- `tick_num` is the sequential number of the current tick.
- `start_time` is the timestamp at which the engine was started. This can be used together with tick_num to
  figure out how much the engine has been delayed compared to the optimal frequency of `TICK_RATE` Hz

Engine exposes an API composed of the following functions:
- `move(id: id, direction: DIRECTION)` given a user id and a `DIRECTION`, registers that this player moved towards `DIRECTION`
  in the current tick. Attempts to move an id that does not exist (or does not exist anymore) will be ignored.
  direction must be one of the `DIRECTION` constants.
  When multiple moves are issued during the same tick, the result is undefined. It is, however, guaranteed that they
  will not move by more than `MOVE_SPEED` in any direction per tick.
- `create()` creates a new player at random coordinates and returns their `ID`.
- `info(id: id)` given a user id returns an object representing that player. If id is not a valid user id, returns null.
  returned object has the following structure:
    - `.id`: id, user id of the player.
    - `.position.x`: number, x coordinate of the player's position
    - `.position.y`: number, y coordinate of the player's position
    - `.rotation`: number, the angle in radians of the player's orientation
    - `.bodyparts`: array, an array of bodyparts
        - Each bodypart has
        - `.type`: BODYPART_TYPE, the type of this part
        - `.health`: number, the health of this part. CELL only.
        - `.faces`: array<number>: the index in this array of the connected bodyparts. CELL only.
        - `.body`: number: the index in this array of the cell this bodypart is connected to. SPIKE and BOUNCE only.
        - `.inflated`: number, the degree of inflation of this bodypart. BOUNCE only.
        - `.working`: number, whether this bodypart is active or not. BOUNCE only.
        
  Note that this structure is both incomplete and non-final.
- `register(id: id, callback: function)` given a user id and a callback function, registers the callback so that it will be called
  every tick, given as parameter the object representation of the player with the given user id.
  Has no effect if user id does not exist.
  
  Calls of the callback are not guaranteed to occur only once per tick or once every tick.
  When a player dies, all callbacks are unregistered. The last call to each callback will be passed null instead of
  a player object.
- `register_global(callback)` given a callback function, registers the callback so that it will be called every
  tick, given as parameter an object representation of the world.
  The passed object is *read-only*, however, the `players` array is copied and may be freely modified.
  This applies *only* to the array, not its components.
  - `.players`: array<player>, an array containing the object representation of all players in the world
- `attach(id: id, type: BODYPART_TYPE, part: number, face: number)` adds a bodypart with the given type to the user with
  the given id by attaching it to the bodypart at the given index at the given face.
  
  Returns 0 on success, 
  -1 if bodypart at given index is not a CELL, 
  -2 if face at the given index is not free,
  -3 if user id does not exist

All other fields, properties or functions which the class may or may not have are internal and may not be
read or modified by the server.

The engine's internal representation of the map uses cardinal coordinates with the orgin at the top left.
Any coordinates that may or may not be exposed by the engine are to be assumed in this format.
