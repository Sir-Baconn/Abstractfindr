var mysql = require('mysql');
// var options = require('./options');

// Global variable - gives access to mysql db connection
var db;

function startConnection() {
    db = mysql.createPool({
        connectionLimit: 10,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_db,
        multipleStatements: true
    });
}

// Closes the connection, still unsure of when to call this at all...
function closeConnection() {
    if (db !== "undefined")
        db.end();
}

// Put functions here that run queries or insert data, access them with db.fnc
function getDocsRandomOrder(worldNum, control, regularLowHigh, callback) {
    var world = 'downloads_' + control + '_' + regularLowHigh + '_' + worldNum;
    var query = "SELECT idfiles, name, abstract, title, " + world + " FROM abstractfindr_demo.files ORDER BY RAND()";
    var q = db.query(query, function(err, result) {
        if (err) throw err;
        // console.log(q.sql);
        return callback(result);
    });
}

function getDocsSortedByDownloads(worldNum, control, regularLowHigh, callback){
    var world = 'downloads_' + control + '_' + regularLowHigh + '_' + worldNum;
    var query = 'SELECT idfiles, name, abstract, title, '+ world + ' FROM abstractfindr_demo.files ORDER BY ' + world + ' DESC, RAND()';
    var q = db.query(query, function(err, result){
        if(err) throw err;
        return callback(result);
    });
}

function getDownloads(docID, worldNum, control, regularLowHigh, callback){
    var world = 'downloads_' + control + '_' + regularLowHigh + '_' + worldNum;
    var query = 'SELECT ' + world + ' FROM abstractfindr_demo.files WHERE idfiles = ?';
    var q = db.query(query, docID, function(err, result){
        if(err) throw err;
        // console.log(q.sql);
        return callback(result);
    });
}

function getFileName(docID, callback){
    var query = 'SELECT name FROM abstractfindr_demo.files WHERE idfiles = ?';
    var q = db.query(query, docID, function(err, result){
        if(err) throw err;
        return callback(result);
    });
}

function updateDownloads(docID, downloads, worldNum, control, regularLowHigh, callback){
    var world = 'downloads_' + control + '_' + regularLowHigh + '_' + worldNum;
    var query = "UPDATE `abstractfindr_demo`.`files` SET " + world + "= ? WHERE `idfiles`= ?";
    var doc = [downloads, docID];
    var q = db.query(query, doc, function(err, result){
        if(err) throw err;
        return callback(result);
    })
}

function updateDownloadsByOne(docID, worldNum, control, regularLowHigh, callback){
    var world = 'downloads_' + control + '_' + regularLowHigh + '_' + worldNum;
    var query = "UPDATE `abstractfindr_demo`.`files` SET " + world + "= downloads_" + control + '_' + regularLowHigh + '_' + worldNum + " + 1 WHERE `idfiles`= ?";
    var q = db.query(query, docID, function(err, result){
        if(err) throw err;
        return callback(result);
    })
}

function insertUserData(userData, callback){
    var query = "INSERT INTO abstractfindr_demo.users SET ?";
    var q = db.query(query, userData, function(err, result){
        if(err) throw err;
        return callback(result);
    });
}

function insertRatings(docID, ratingRaw, worldNum, control, regularLowHigh, callback){
    var ratingFull = {
        idfiles: docID,
        rating: ratingRaw,
        world: worldNum,
        control: control,
        regularLowHigh: regularLowHigh
    };
    var query = "INSERT INTO abstractfindr_demo.ratings SET ?";
    var q = db.query(query, ratingFull, function(err, result){
        if(err) throw err;
        return callback(result);
    })
}

module.exports = {
    startConnection: startConnection,
    closeConnection: closeConnection,

    getDocsRandomOrder: getDocsRandomOrder,
    getDocsSortedByDownloads: getDocsSortedByDownloads,
    getDownloads: getDownloads,
    getFileName: getFileName,

    updateDownloads: updateDownloads,
    updateDownloadsByOne: updateDownloadsByOne,

    insertUserData: insertUserData,
    insertRatings: insertRatings
};