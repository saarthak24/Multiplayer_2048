//imports
var express = require("express");
var app = express();
var server = app.listen(3000);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("2048.db");
console.log('Listening on 3000');
console.log('http://localhost:3000/');
var io = require('socket.io').listen(server);
var players = 0;
var scoreOne;
var nameOne;
var scoreTwo;
var nameTwo;

app.get("/", function(request, response) {
    response.sendFile('index.html', {
        root: __dirname
    })
});

app.use('/', express.static(__dirname));

io.on("connection", function(socket) {
    console.log('Successfully Loaded')
    if (players < 2) {
        players++;
    }

    db.each("SELECT * FROM HighScores", function(err, row) {
        if (!err) {
            socket.emit("highScores", {
                sqlScore: row.score,
                sqlName: row.name,
            });
            socket.broadcast.emit("highScores", {
                sqlScore: row.score,
                sqlName: row.name,
            });
        }
    })
    socket.on('updateMove', function(data) {
        socket.emit("fromserver", {
            newscore: data.score
        })
        socket.broadcast.emit("fromserver", {
            newscore: data.score
        })
    })
    socket.on("score", function(data) {
        if (scoreOne == null && nameOne == null) {
            scoreOne = data.score;
            nameOne = data.name;
            db.run("INSERT INTO HighScores(score, name) VALUES(?, ?);", [scoreOne, nameOne]);
        } else {
            scoreTwo = data.score;
            nameTwo = data.name;
            db.run("INSERT INTO HighScores(score, name) VALUES(?, ?);", [scoreTwo, nameTwo]);
        }
        db.each("SELECT * FROM HighScores", function(err, row) {
            if (!err) {
                socket.emit("highScores", {
                    sqlScore: row.score,
                    sqlName: row.name,
                });
                socket.broadcast.emit("highScores", {
                    sqlScore: row.score,
                    sqlName: row.name,
                });
            }
        })
    })

});
