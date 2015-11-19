var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var multer  = require('multer');
var promise = require('promise');
var song = require('../models/song').Song;
var user = require('../models/user').User;
var gm = require('gm');
var thumbFolder = __dirname + '/../static/thumbs/';
var tempFolder = __dirname + '/../static/temps/';
var upload = multer({ dest: tempFolder });
router.route('/upload')
      .post(upload.single('photo'), function(req, res) {
        gm(tempFolder + req.file.filename)
        .resize(300, 300, '^')
        .gravity('Center')
        .crop(300, 300)
        .write(thumbFolder + req.file.filename + '.jpg', function(err) {
          if (!err) {
            var message = {'result': true, 'path': '/static/thumbs/' + req.file.filename + '.jpg'};
            res.json(message);
          } else {
            console.error(err);
          }
        })
      });

router.route('/fav')
      .post(function(req, res) {
        var sid = req.body.songId;
      	var userid = req.body.userId;
      	var faved = req.body.faved;
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
module.exports = router;