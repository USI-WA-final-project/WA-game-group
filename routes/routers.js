// This file is the same as in the assignments: it looks through all the folders and makes a router for each.

const fs = require('fs');

const dirEntries = fs.readdirSync(__dirname);
const base = __dirname + '/';
let routers = {};

try{
    dirEntries.forEach(function(dirEntry){
        const stats =  fs.statSync(base + dirEntry);
        //try to load router of dir
        if(stats.isDirectory()){
            try{
                //add router to our list of routers;
                routers[dirEntry] = require(base + dirEntry + '/router');
            }catch(err){
                console.log('Could not get router for ' + dirEntry);
                console.log(err.toString() + err.stack);
            }
        }
    });
}catch(err){
    console.log('Error while loading routers');
    console.log(err.stack);
    //We don't know what happened, export empty object
    routers = {}
}finally{
    module.exports = routers;
}

