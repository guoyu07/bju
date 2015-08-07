var song = require('../models/song').Song;
var user = require('../models/user').User;
var express = require('express');
var router = express.Router();

var yun = require('../yun');
var Promise = require('promise');

//route for create a song
router.route('/songs')
      .get(function(req, res) {
        song.find({}, {}, function(data) {
          res.json(data);
        });
      })
      .post(function(req, res) {
        var data = req.body;
        var userid = data.userid;
        function addSong(data) {
      		if (!data.lyrics) {
      			data.lyrics = '';
      		}
      		var userData = {
      			sid: data.id,
      			title: data.title,
      			artist: data.artist,
      			pic: data.pic,
            album: data.album,
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
            song = song.toJSON();
            song.exsit = false;
      			res.json(song);
      		})
      	};

        addSong(data).then(userAddSong);
      });
//route for single song
router.route('/song/:id')
      .get(function(req, res) {
        var sid = req.params.id * 1;
      	//first select song from the databse
      	//check if it's exsit
      	function getSongFromDB (sid) {
      		return new Promise(function(resolve, reject) {
      			song.findOne(sid, function(err, data) {
      				if (!err) {
                data = data.toJSON();
      					data.exsit = true;
                data.pass = true;
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
      })
      .delete(function(req, res) {

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

module.exports = router;
