const mongoose = require('mongoose');

require('./models/Player');
const Player = mongoose.model('Player');

var database = {
    /**
     * Gets all the player objects
     * @returns An array of player objects
     */
    getAllPlayers: function() {
        return Player.find({}).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    },

    /**
     * Gets a single player object, given its id
     * @param id The player id
     * @returns A player object
     */
    getPlayerById: function(id) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    },

    /**
     * Adds a player to the database
     * @param {Object} player The player object
     */
    addPlayer: function(player) {
        let newPlayer = new Player({
            id: player.id,
            color: player.color,
            username: player.username,
            spawnPos: player.spawnPos
        });

        return newPlayer.save().then(function(saved) {
            console.log('[DB] Created player', saved.id, '-', saved.username);
            return true;
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    },

    /**
     * Removes a player from the database
     * @param {Number} id The player id
     */
    removePlayer: function(id) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            found.remove().then(function(removed) {
                console.log('[DB] Removed player', removed.id, '-', removed.username);
                return true;
            }).catch(function(err) {
                console.log("[DB]", err.message);
                return false;
            });            
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    }, 

    /**
     * Marks a player as inactive 
     * (either game over or disconnection)
     * @param {Number} id The player id
     */
    terminatePlayer: function(id) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            found[0].dateEnded = Date.now();
            found[0].active = false;

            return found[0].save().then(function(saved) {
                console.log('[DB] Archived player', saved.id, '-', saved.username);
                return true;
            }).catch(function(err) {
                console.log("[DB]", err.message);
                return false;
            });
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    },

    /**
     * Updates the player data iff it already exists
     * @param {Number} id The player id
     * @param {Object} newPlayer The new player object
     * @returns true on success, false otherwise
     */
    updatePlayer: function(id, newPlayer) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            let old = found[0];
            if (newPlayer.id != undefined && newPlayer.id != old.id) {
                old.id = newPlayer.id;
            }
            if (newPlayer.color != undefined && newPlayer.color != old.color) {
                old.color = newPlayer.color;
            }
            if (newPlayer.username != undefined && newPlayer.username != old.username) {
                old.username = newPlayer.username;
            }
            if (newPlayer.spawnPos.x != undefined && newPlayer.spawnPos.x != old.spawnPos.x) {
                old.spawnPos.x = newPlayer.spawnPos.x;
            }
            if (newPlayer.spawnPos.y != undefined && newPlayer.spawnPos.y != old.spawnPos.y) {
                old.spawnPos.y = newPlayer.spawnPos.y;
            }
            if (newPlayer.dateStarted != undefined && newPlayer.dateStarted != old.dateStarted) {
                old.dateStarted = newPlayer.dateStarted;
            }
            if (newPlayer.dateEnded != undefined && newPlayer.dateEnded != old.dateEnded) {
                old.dateEnded = newPlayer.dateEnded;
            }
            if (newPlayer.active != undefined && newPlayer.active != old.active) {
                old.active = newPlayer.active;
            }
            if (newPlayer.score != undefined && newPlayer.score != old.score) {
                old.score = newPlayer.score;
            }

            return old.save().then(function(saved) {
                console.log('[DB] Updated player', saved.id, '-', saved.username);
                return true;
            }).catch(function(err) {
                console.log("[DB]", err.message);
                return false;
            });
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    }
};

module.exports = database;