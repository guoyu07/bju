var restify = require('restify');
var mongoose = require('mongoose');

var db = mongoose.connect("mongodb://localhost");

var user = require('./userModel').User;
var song = require('./songModel').Song;
var yun = require('./yun');
var crypto = require('crypto');
var qs = require('querystring');
var CookieParser = require('restify-cookies');


function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}

var server = restify.createServer({ name: 'mongo-api' });


server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
).use(restify.fullResponse()).use(restify.bodyParser());

server.use(CookieParser.parse);


server.post('/add', function(req, res, next) {
	var sid = req.params.songId;
  var userid = req.params.userId;
	yun.songDetail(sid, function(data) {
		var userData = {
			sid: data.id,
			title: data.title,
			artist: data.artist,
			pic: data.pic,
			url: data.url,
      _creator: userid
 		};
     console.log(userData);
 		song.add(userData, function(data) {
       //data.status = "success";
       res.json(data);
     }, function(error) {
       //data.status = "fail";
       res.json(error);
     });
	});
});
server.get('/list', function(req, res, next) {
  song.find({}, function(data) {
    res.json(data);
  });
});

server.get('/delete/:id', function(req, res) {
	var _id = req.params.id;
	var msg = {_id : _id};
  song.delete(_id, function(error) {
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
