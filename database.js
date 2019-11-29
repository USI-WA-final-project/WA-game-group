const mongoose = require('mongoose');

require('./models/Player');
const Player = mongoose.model('Player');

var database = {
    /**
     * Gets all the player objects
     * @returns An array of player objects
     */
    getAll: function() {
        return Player.find({}).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    /**
     * Gets a single player object, given its id
     * @param id The player id
     * @returns A player object
     */
    getById: function(id) {
        const filter = { id: id };

        return Player.find(filter).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    /**
     * Adds a player to the database
     * @param {Object} player The player object
     */
    add: function(player) {
        let newPlayer = new Player({
            id: player.id,
            color: player.color,
            username: player.username,
            spawnPos: player.spawnPos
        });

        newPlayer.save().then(function(saved) {
            console.log('Created player', saved.id, '-', saved.username);
            return true;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    /**
     * Removes a player from the database
     * @param {Number} id The player id
     */
    remove: function(id) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            found.remove().then(function(removed) {
                console.log('Removed player', removed.id, '-', removed.username);
                return true;
            }).catch(function(err) {
                console.log(err.message);
                return false;
            });            
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    }, 

    /**
     * Marks a player as inactive 
     * (either game over or disconnection)
     * @param {Number} id The player id
     */
    terminate: function(id) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            found[0].dateEnded = Date.now();
            found[0].active = false;

            found[0].save().then(function(saved) {
                console.log('Archived player', saved.id, '-', saved.username);
                return true;
            }).catch(function(err) {
                console.log(err.message);
                return false;
            });
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    /**
     * Updates the player data (TODO)
     * @param {Number} id The player id
     * @param {Object} newPlayer The new player object
     */
    update: function(id, newPlayer) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {   
            //TODO
            found[0].save().then(function(saved) {
                console.log('Updated player', saved.id, '-', saved.username);
                return true;
            }).catch(function(err) {
                console.log(err.message);
                return false;
            });
            return true;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    }
};

module.exports = database;