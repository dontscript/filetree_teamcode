(function () {
    'use strict';

    var express = require('express');
    var path = require('path');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var fs = require('fs');

    var routes = require('./routes.js');

    var app = express();
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    app.set('port', 3000);

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());

    app.use(express.static(path.join(__dirname, '../client')));
    app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
    app.use('/', routes);


    var server = app.listen(app.get('port'), '0.0.0.0', function () {
        console.log('Express server listening on ' + server.address().address + ":" + server.address().port);
    });

    const treeRoot = 'C:\\Users\\User\\Downloads\\Desktop\\file_explorer\\teamcode\\';
    // const treeRoot = "F:\\Git\\filetree_teamcode\\teamcode";
    //for socketio
    var io = require('socket.io').listen(server);

    var colorList = ['#ff0000', '#8c8c08', '#3faf1a', '#af6e1a', '#5d13ad', '#960a91', '#960a50', '#960a17', '#0a968f'];
    var colorListIndex = 0;
    var clients = {};

    //setting socket
    io.on('connection', function (socket) {
        console.log('a new username connected');

        //on user disconected
        socket.on('disconnect', function () {
            //clients.splice(clients.indexOf(socket.username),1);
            io.emit('deleteCursor', socket.username);

            console.log('a user disconnected');
        });

        socket.on('joinRoom', function (connectionInfos) {
            socket.username = connectionInfos.username;
            socket.room = connectionInfos.room;

            socket.leave(socket.id);
            socket.join(socket.room);
            console.log('ROOM' + socket.room);
            console.log('USER' + socket.username);
            var socketCursor = [];
            socketCursor.push(GetCursorByName(socket.username));
            socket.broadcast.emit('appendCursors', socketCursor); //must be array even only one element

            socket.emit('appendCursors', GetAllCursorInRoom(socket));
            console.log(io.sockets.adapter.rooms);
        });

        socket.on('getFileContent', function (fileURL) {

            fs.readFile(path.join(treeRoot, decodeBase64(fileURL)), 'utf8', function (err, data) {
                if (err) {
                    socket.emit('receiveFileContent', 'File not found!');
                    // return console.log(err);
                }
                socket.emit('receiveFileContent', data);
            });
        });

        //when server receive input from Editor on.change event
        socket.on('document-update', function (message) {
            io.to(socket.room).emit('document-coming', message);
            //console.log('document',message);
            // db.insert('temp_files', message);
        });

        //when server receive input from Cursor of Editor on.change event
        socket.on('cursor-update', function (message) {
            io.to(socket.room).emit('cursor-coming', message);
            //console.log('cursor',message);
            // db.insert('temp_cursors', message);
        });

        //when server receive request to save document to database, 1s after stop typing
        socket.on('document-save', function (message) {
            //db.insert('edit',message);
            fs.writeFile(path.join(treeRoot, decodeBase64(message.id)), message.value, 'utf8', function (err) {
                // return console.log(err);
            });
        });

        /*if (!isDBListening)
         {
         isDBListening=true;

         db.changes('temp_files',function(err, row){
         io.to(socket.room).emit('document-coming',row);
         });

         db.changes('temp_cursors',function(err, row){
         io.to(socket.room).emit('cursor-coming',row);
         });

         }*/
    });

    function encodeBase64(text) {
        return new Buffer(text).toString('base64');
    }

    function decodeBase64(text) {
        return new Buffer(text, 'base64').toString('ascii');
    }

    function GetAllCursorInRoom(socket) {
        var socketsInRoom = io.sockets.adapter.rooms[socket.room].sockets;

        var result = [], username = '';
        for (var socketID in socketsInRoom) {
            username = io.sockets.connected[socketID].username;
            if (username != socket.username) {
                result.push(GetCursorByName(username));
            }
        }
        return result;
    }

    function GetCursorByName(name) {
        console.log(colorList[colorListIndex]);
        var result = {};
        result.username = name;
        result.value =
            '<div class="CodeMirror-cursors" id="' + name + '">\n\t' +
            '<div class="CodeMirror-cursor" style="left: 4px; top: 0px; height: 15px; display:block">&nbsp;</div>\n' +
            '<div id="' + name + '-cursor" class="cursor-name" style="left: 4px; top: 0px; height: 15px; display:none; color: white; background-color: ' + colorList[colorListIndex] + '">' + name + '</div>\n' +
            '</div>';
        colorListIndex++;
        return result;
    }

    module.exports = app;
}());