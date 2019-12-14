const mongoose = require('mongoose');

require('./models/Player');
const Player = mongoose.model('Player');
require('./models/Moment');
const Moment = mongoose.model('Moment');

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
     * Gets all the player filtered by a filter
     * @param {Object} filter The filter object
     * @returns An array of player objects
     */
    getPlayersByFilter: function(filter) {
        return Player.find(filter).lean().then(function(found) {
            return found;
        }).catch(function(err) {
            console.log("[DB]", err.message);
            return false;
        });
    },

    /**
     * Adds a player to the database
     * @param {Object} player The player object to add
     * @returns true on success, false otherwise
     */
    addPlayer: function(player) {
        let newPlayer = new Player({
            id: player.id,
            color: player.custom.color,
            username: player.custom.username,
            spawnPos: { x: player.position.x, y: player.position.y }
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
     * @returns true on success, false otherwise
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
     * @param {Number} score The partial score (resources + kills)
     * @returns the player object on success, null otherwise
     */
    terminatePlayer: function(id, score) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            found[0].dateEnded = Date.now();
            found[0].active = false;
            found[0].score = score + (found[0].dateEnded - found[0].dateStarted) / 1000;

            return found[0].save().then(function(saved) {
                console.log('[DB] Archived player', saved.id, '-', saved.username);
                return found[0];
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
            if (newPlayer.color != undefined && newPlayer.color != old.custom.color) {
                old.custom.color = newPlayer.color;
            }
            if (newPlayer.username != undefined && newPlayer.username != old.custom.username) {
                old.custom.username = newPlayer.username;
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
    },

    /**
     * Get all moments
     * @returns A promise containing the moments
     */
    getAllMoments: function() {
        return Moment.find({});
    },

    /**
     * Get a single moment by its id
     * @param {Number} id The moment's id
     * @returns A promise containing the moment
     */
    getMomentById: function(id) {
        return Moment.findById(id);
    },

    /**
     * Adds a moment to the database
     * @param {Object} moment The moment to add
     * @returns A promise 
     */
    addMoment: function(moment) {
        return Moment({
            src: moment.src
        }).save();
    },

    /**
     * Updates a moment
     * @param {Number} id The id of the moment to update
     * @param {Object} data The data to update
     * @returns A promise
     */
    updateMoment: function (id, data) {
        return Moment.findById(id)
            .then((item) => {
                if (data.name) item.name = data.name;
                if (data.uploaded) item.uploaded = data.uploaded;

                return item.save();
            });
    },

    /**
     * Removes a moment
     * @param {Number} id The id of the moment to remove
     */
    removeMoment: function (id) {
        return Moment.findById(id)
            .then((item) => {
                return item.remove();
            }); 
    }
};

module.exports = database;