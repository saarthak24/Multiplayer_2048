//imports
var express = require("express");
var app = express();
var server = app.listen(3000);
console.log('Listening on 3000')
console.log('http://localhost:3000/')
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser')
var playerCount = 0;
//app.use(bodyParser())

app.get("/", function(request, response) {
    response.sendFile('index.html', {
        root: __dirname
    })
})

app.use('/', express.static(__dirname))

io.on("connection", function(socket) {
    console.log('Successfully Loaded')
    if (playerCount <= 2) {
        playerCount++;
    }
})
