const mongoose = require('mongoose');

require('./models/Player');
const Player = mongoose.model('Player');

var database = {
    getAll: function() {
        Player.find({}).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    getById: function(id) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            return found;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    //Adds a player to the DB
    add: function(id, username) {
        let newPlayer = new Player({
            id: id,
            username: username
        });

        newPlayer.save().then(function(saved) {
            return true;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    },

    //Remove a player from the DB
    remove: function(id) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            found.remove().then(function(removed) {
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

    //Marks the player as inactive (game over/disconnected)
    terminate: function(id) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            found[0].dateEnded = Date.now();
            found[0].active = false;

            found[0].save().then(function(saved) {
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

    //Update player data
    update: function(id, newPlayer) {
        const filter = { id: id };

        Player.find(filter).then(function(found) {
            //TODO
            return true;
        }).catch(function(err) {
            console.log(err.message);
            return false;
        });
    }
};

module.exports = database;