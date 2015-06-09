var restify = require('restify');
var mongoose = require('mongoose');
var user = require('./userModel').User;
var yun = require('./yun');
var crypto = require('crypto');
var qs = require('querystring');
var CookieParser = require('restify-cookies');

db = mongoose.createConnection("mongodb://localhost");
var Schema = mongoose.Schema,
 ObjectId = Schema.ObjectID;
var Song = new Schema({
	sid: Number,
	title: String,
	artist: String,
	pic: String,
	url: String
});

function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}

var Song = mongoose.model('Song', Song);

var server = restify.createServer({ name: 'mongo-api' });


server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
).use(restify.fullResponse()).use(restify.bodyParser());

server.use(CookieParser.parse);


server.get('/add/:id', function(req, res, next) {
	var sid = req.params.id;
	yun.songDetail(sid, function(data) {
		var userData = {
			sid: data.id,
			title: data.title,
			artist: data.artist,
			pic: data.pic,
			url: data.url
 		};
 		var song = new Song(userData);
 		song.save(function(error, data) {
 			data = data || {};
 			if (!error) {
 				data.status = "success";
 				res.json(data);
 			} else {
 				data.status = "fail";
 				res.json(data);
 			}
 		})
	});
});
server.get('/list', function(req, res, next) {
	Song.find({}, function (error, song) {
		if (!error) {
			res.json(song);
		}
	});
});
server.get('/delete/:id', function(req, res) {
	var _id = req.params.id;
	var msg = {_id : _id};
	Song.remove({ '_id': _id}, function(error) {
		if (!error) {
			msg.status = 'success';
		} else {
			msg.status = 'fail';
		}
		res.json(msg);
	});
});
server.post('/adduser', function(req, res) {
	var data = req.params;
	var userData = {
		name: data.name,
		password: data.password,
		avatar: data.avatar
	};
	user.create(userData, function(data) {
		res.json(data);
	});
});

server.post('/login', function(req, res) {
  var data = req.params;
  var cookies = req.cookies;
  user.login(data.username, md5(data.password), function(data) {
    if (data.data) {
      var cookieId = data.data._id;
      res.setCookie('userid', cookieId);
    };
    res.json(data);
  });
});

server.post('/signup', function(req, res) {
  var data = req.params;
  user.create(data, function(data) {
    res.json(data);
  });
});

server.get('/checkuser/:name', function(req, res) {
  var name = req.params.name;
  user.check(name, function(data){
    res.json(data);
  });
});
server.get('/connect/:sid', function(req, res, next) {
	var sid = req.params.sid;
	yun.doubanInfo(sid, function(dinfo) {
    user.check(dinfo.name, function(data) {
      if (!data.exsitUser) {
        data.info = dinfo;
      }
      res.json(data);
    });
    //res.json(dinfo);
	});
});
server.get('/users', function(req, res, next) {
	var users = [
		{id: 1, name: 'viking'},
		{id: 2, name: 'weson'},
		{id: 3, name: 'lee hao'}
	];
	res.json(users);
});
server.get('/song/:id', function(req, res, next) {
	yun.songDetail(req.params.id, function(data) {
		res.send(data);
		next();
	});
});
server.listen(5000, function() {
	console.log('%s listening at %s', server.name, server.url);
});
