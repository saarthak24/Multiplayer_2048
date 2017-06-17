var express = require("express")
var app = express();
var http = require("http").Server(app)
var io = require("socket.io")(http)
var bodyParser=require('body-parser')
var playerCount=0;
//app.use(bodyParser())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
http.listen(3000, function () {
  console.log('Example app listening on port 3000!')
  app.use(express.static( __dirname + '/files' ));
})

io.on('connection', function(socket){
	playerCount++;
	console.log(playerCount)
	socket.on('scoreUpdate', function(data){
		console.log(data)

	});

})
