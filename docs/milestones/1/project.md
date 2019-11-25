# Milestone 1
### 2019-11-25

## Design & Mockups
Mockups and designs are available on [figma](https://figma.com/file/bJyTR3ETHzu5W3cJxxbRwd/Legend-of-Ajax-SA3).

## Gameplay

* Players should walk around on a fairly large map to gather resources
* Resources should be deletable and respawn
* Resources are gathered by:
    * Standing adjacent to a resource "node"
* Resources can be used to craft things
* Structures (See below)

## Body parts

### Capabilities

|-----------|-------------|-----------------|------------------|
| Body part | Deal damage | Provide defense | Obtain resources |
| Cell      |             |                 | x                |
| Spikes    | x           |                 | x                |
| Shields   |             | x               |                  |
| Bouncers  |             |                 |                  |
|-----------|-------------|-----------------|------------------|


### Contact table

|---------|-----------------|-------------------|-------------------|-------------------|
|         | Cell            | Spike             | Shield            | Bouncer           |
| Cell    |                 | Cell destroyed    |                   | Cell is bounced   |
| Spike   | Cell destroyed  | Both destroyed    |                   | Bouncer destroyed |
| Shield  |                 |                   |                   | Shield is bounced |
| Bouncer | Cell is bounced | Bouncer destroyed | Shield is bounced | Both are bounced  |
|---------|-----------------|-------------------|-------------------|-------------------|


## Resources

Resources are "constant" / persisted through games.
When a player dies, its resources (and resources used to create its body parts) are
released back into the world for other players to collect.

* Food (Health regen)
* Speed boost
* "Pieces" for structures
* "Pieces" for body parts


## Structures

Players may build structures that are "constant" / persisted through games.

Resources may be destroyed by players using spikes or decay after some time.
Resources used to create the structures are then released back into the world
for other players to collect.

Types
* Walls
* Towers (attack players)
* Traps (damage enemies that walk over it, then disarm themselves)

## Characters

Characters start as a simple hexagon.
Each hexagon has 6 faces to which it's possible to attach something else.
Players may attach new _cells_ (hexagons) or _body parts_ (spikes, shields...).
Players may not use more than 2/3 of their faces to avoid uncompetitive behaviors.

The initial hexagon cell is called the "mother cell" and whenever it's attacked / killed
the player looses.

When "external" cells are attacked they die and all the resources attached to them are
released back into the world.

The players are represented _logically_ by graphs, where each cell is a node and
has up to 6 child. Each child may be a cell (it adds 5 "connections"), or
a body part such as spike / shield / bouncer (they don't add any new "connections").

This structure is then fed into code that will turn this into a rendered image
drawn using svg paths.

## Sounds

All sounds are optionals

* When hitting an enemy
* When gathering resources
* When walking on traps/taking damage

## Persistance

* Players are volatile - on death they lose all state
* The world is persistent between players
