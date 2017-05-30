const host = 'teamcode.me'

//setting environment variables
var helperModule = require('./lib/TeamCodeHelper.js');
var helper = new helperModule();

var express = require('express');

const util = require('util'); //to inspect all property of Object
var app = express();
var expressPort = 8888;

//for passport js
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var md5 = require('md5');


//custom mysql with user
var mysqldb = require ('./lib/mysqldb.js');
var mysql = new mysqldb();
const USER_TABLE = 'users';

mysql.setup({
	host: host,
	user: 'loc',
	password:'12341234',
	database: 'teamcode'});

var User = require('./models/User.js');
var Token = require('./models/Token.js');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/authen', function(req,res){
	
	mysql.findTokenByValue(req.body.token,function(err,token){
		if (err==false){

			var tempToken = new Token();
			tempToken.initial(token);

			if (req.body.email == tempToken.getUserEmail())
			{				
				var expiresAt = new Date(tempToken.getExpiresAt());
				var now = new Date();
				
				if (now.getTime() < expiresAt.getTime())
				{
					res.send('Your token is correct, match and available.');
				}
				else
				{
					res.send('Your token is expired.');	
				}
			}
			else
			{
				res.send('This is not your token.');
			}
		}
		else
		{
			res.send('Your token is not exists.');
		}
	});
});

app.post('/register',function(req,res){
	
	if(!req.body)	
		return res.sendStatus(404);
	mysql.insertUser(req,function (err,result){
		if (err==true){
			console.log('Create email: '+req.body.email+ 'complete!');
		}
	});
	
	res.send('Your account has been created. Try to <a href="/login">Login</a>');
});

app.post('/login',urlencodedParser,function(req,res){

	var tempUser = new User();
	
	mysql.findUserByEmail(req.body.email,function(err,user){
		if (err==false){
			tempUser.initial(user);
			
			if(tempUser.CheckPassword(req.body.password)){;
				mysql.insertToken(req,function(err){
					if (err==true)
					{
						console.log('Token has been create.');
						res.send(err);
						
						//handle duplicate token down here
					}
				});
			}
		}
		else
		{
			console.log('Email: "'+req.body.email+'"" not found!')
		}
	});
});


//for socketio
var io = require('socket.io').listen(app.listen(expressPort));

//determine RethinkDB is listening to any change on some table
var isDBListening=false;
var database = require('./lib/db.js')
var db = new database();

var colorList = ['#ff0000','#8c8c08','#3faf1a','#af6e1a','#5d13ad','#960a91','#960a50','#960a17','#0a968f'];
var colorListIndex=0;

//setup({host: ,databaseName: ,port: })
db.setup({host: host, databaseName: 'teamcode',port: 28015});


//route root page
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html')
});

//static route
app.use('/', express.static(__dirname));
app.use('/bower',express.static(__dirname+'/bower_components'));
app.use('/nodejs',express.static(__dirname+'/node_modules'));
app.use('/css',express.static(__dirname+'/customCSS'));
app.use('/emmet',express.static(__dirname+'/emmet'));
app.use('/csslintjs',express.static(__dirname+'/csslintjs'));

var clients ={};
//setting socket
io.on('connection',function(socket){	
	console.log('a new username connected');

	//on user disconected
	socket.on('disconnect',function(){
		//clients.splice(clients.indexOf(socket.username),1);
		io.emit('deleteCursor',socket.username);
		
		console.log('a user disconnected');
	});

	socket.on('joinRoom',function(connectionInfos){
		socket.username = connectionInfos.username;
		socket.room = connectionInfos.room;

		socket.leave(socket.id);
		socket.join(socket.room);

		var socketCursor = [];
		socketCursor.push(GetCursorByName(socket.username));
		socket.broadcast.emit('appendCursors',socketCursor); //must be array even only one element

		socket.emit('appendCursors',GetAllCursorInRoom(socket));
		console.log(io.sockets.adapter.rooms);
	});
	

	//when server receive input from Editor on.change event
	socket.on('document-update',function (message){
		db.insert('temp_files',message);
	});

	//when server receive input from Cursor of Editor on.change event
	socket.on('cursor-update',function (message){
		db.insert('temp_cursors',message);
	});

	//when server receive request to save document to database, 1s after stop typing
	socket.on('document-save',function (message){
		db.insert('edit',message);
	});
	

	if (!isDBListening)
	{
		isDBListening=true;

		db.changes('temp_files',function(err, row){
			io.to(socket.room).emit('document-coming',row);
		});

		db.changes('temp_cursors',function(err, row){
			io.to(socket.room).emit('cursor-coming',row);
		});

	}
});

function GetAllCursorInRoom(socket){
	var socketsInRoom = io.sockets.adapter.rooms[socket.room].sockets;
		
	var result=[],username='';
	for(var socketID in socketsInRoom)
	{
		username=io.sockets.connected[socketID].username;
		if (username != socket.username)
		{
			result.push(GetCursorByName(username));
		}
	}
	return result;
}

function GetCursorByName(name){
	var result={};
	result.username = name;
	result.value = 
		'<div class="CodeMirror-cursors" id="'+name+'">\n\t'+
			'<div class="CodeMirror-cursor" style="left: 4px; top: 0px; height: 15px; display:block">&nbsp;</div>\n'+
			'<div id="'+name+'-cursor" class="cursor-name" style="left: 4px; top: 0px; height: 15px; display:none; color: white; background-color: '+colorList[colorListIndex]+'">'+name+'</div>\n'+
		'</div>';
	colorListIndex++;
	return result;
}

console.log('ExpressJS listening on '+expressPort);
