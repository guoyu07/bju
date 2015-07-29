//require main tools
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//connect to mongodb
var db = mongoose.connect("mongodb://localhost");

//import all routes middleware
var songRoute = require('./routes/song');
var collectionRoute = require('./routes/collection');
var userRoute = require('./routes/user');
var utilRoute = require('./routes/util');

//port number
var port = 5000;
var prefix = '';
var server = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//override the server with middleware route
server.use(prefix, songRoute);
server.use(prefix, collectionRoute);
server.use(prefix, userRoute);
server.use(prefix, utilRoute);

server.listen(port);
console.log('Magic happens on port ' + port);
