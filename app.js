var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(1337);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var current_user = 0;
var picked = [];

io.sockets.on('connection', function (socket) {
	
	if (io.sockets.clients().length == 1)
		current_user = 0;
	
	socket.emit('welcome', { id: socket.id, current: io.sockets.clients()[current_user].id, users: JSON.stringify(getClientIds(io.sockets.clients())), picked: JSON.stringify(picked) });
	socket.broadcast.emit('new player', { player: socket.id });
	
	socket.on('pickmade', function (id) {
		current_user = (current_user + 1) % io.sockets.clients().length;
		socket.broadcast.emit('pick made', { player: socket.id, player_id: id, nextpick: io.sockets.clients()[current_user].id });
	});
	
	socket.on('disconnect', function() {
    	socket.broadcast.emit('disconnect', { player: socket.id });
		io.sockets.clients().splice(io.sockets.clients().indexOf(socket), 1);
    });
  
});

function getClientIds(clients) {
	var ids = [];
	for(var i = 0; i < clients.length; i++) {
		ids.push(clients[i].id);
	}
	return ids;
}