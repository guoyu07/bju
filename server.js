var restify = require('restify');
var mongoose = require('mongoose');

var db = mongoose.connect("mongodb://localhost");

var user = require('./userModel').User;
var song = require('./songModel').Song;
var collection = require('./collectionModel').Collection;
var yun = require('./yun');
var crypto = require('crypto');
var qs = require('querystring');
var CookieParser = require('restify-cookies');
var Promise = require('promise');

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

server.get('/song/:id', function(req, res, next) {
	var sid = req.params.id * 1;
	//first select song from the databse
	//check if it's exsit
	function getSongFromDB (sid) {
		return new Promise(function(resolve, reject) {
			song.findOne(sid, function(err, data) {
				if (!err) {
					data.exsit = true;
					resolve(data);
				} else {
					var emsg = {
						exsit: false,
						sid: sid
					}
					resolve(emsg);
				}
			});
		})
	}

	//if it's not exsit, fetch it from the yun.js script
	function getSongFromYun(data) {
		var exsit = data.exsit;
		return new Promise(function(resolve, reject) {
			if (exsit) {
				resolve(data);
			} else {
				yun.songDetail(sid, function(err, data) {
					if (!err) {
						data.noexsit = true;
						resolve(data);
					} else {
						reject(err);
					}
				});
			}
		});
	}
	getSongFromDB(sid).then(getSongFromYun).then(function(data) {
		res.json(data);
	});
});
server.post('/create', function(req, res, next) {
	var postData = req.params;
	collection.create(postData, function(data) {
		res.json(data);
	})
});
server.post('/add', function(req, res, next) {

	var sid = req.params.songId;
  var userid = req.params.userId;

	//three promises bind together, looks amazing~
	function getSongDetail(sid) {
		return new Promise(function(resolve, reject) {
			yun.songDetail(sid, function(err, data) {
				if (!err) {
					resolve(data);
				} else {
					reject(err);
				}
			});
		});
	};

	function addSong(data) {
		if (!data.lyrics) {
			data.lyrics = '';
		}
		var userData = {
			sid: data.id,
			title: data.title,
			artist: data.artist,
			pic: data.pic,
			url: data.url,
			lyrics: data.lyrics,
			_creator: userid,
			fans: []
		};
		return new Promise(function(resolve, reject) {
			song.add(userData, function(data) {
				//data.status = "success";
				resolve(data);
			}, function(error) {
				//data.status = "fail";
				reject(error);
			});
		});
	};

	function userAddSong(song) {
		var condition = {'$push': {'pubSongs': song._id}};

		user.update(userid, condition, function(data) {
			res.json(song);
		})
	};

	getSongDetail(sid).then(addSong).then(userAddSong);

});

server.post('/fav', function(req, res, next) {
	var sid = req.params.songId;
	var userid = req.params.userId;
	var faved = req.params.faved;
	var condition = {},
			uCondition = {};

	if (faved) {
		condition = {'$push': {'fans': userid}};
		uCondition = {'$push': {'favSongs': sid}};
	} else {
		condition = {'$pull': {'fans': userid}};
		uCondition = {'$pull': {'favSongs': sid}};
	}

	function updateSongFav() {
		return new Promise(function(resolve, reject) {
			song.update(sid, condition, function(data) {
				resolve(data);
			});
		});
	};
	function updateUserFav() {
		return new Promise(function(resolve, reject) {
			user.update(userid, uCondition, function(data) {
				resolve(data);
			})
		});
	};
	Promise.all([updateSongFav(), updateUserFav()])
				 .then(function(data) {
						res.json(data);
				 });

});
server.get('/list', function(req, res, next) {
  song.find({}, {}, function(data) {
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
server.get('/user/:name', function(req, res, next) {
	var username = req.params.name;
	user.getInfo(username, function(data) {
		res.json(data);
	})

});

server.listen(5000, function() {
	console.log('%s listening at %s', server.name, server.url);
});
