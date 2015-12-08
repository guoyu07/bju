var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var multer  = require('multer');
var promise = require('promise');
var song = require('../models/song').Song;
var user = require('../models/user').User;
var gm = require('gm');
var messager = require('../utils/publish');
var thumbFolder = __dirname + '/../static/thumbs/';
var tempFolder = __dirname + '/../static/temps/';
var fullFolder = __dirname + '/../static/fullsize/'
var upload = multer({ dest: tempFolder });
function savePhoto(folder, filename, size) {
  return new Promise(function(resolve, reject) {
    gm(tempFolder + filename)
    .resize(size.width, size.height, '^')
    .gravity('Center')
    .crop(size.width, size.height)
    .write(folder + filename + '.jpg', function(err) {
      if (!err) {
        var prefix = '';
        var type = '';
        if (folder.indexOf('thumbs') != -1) {
          prefix = '/static/thumbs/';
          type = 'thumbs';
        } else if (folder.indexOf('fullsize') != -1) {
          prefix = '/static/fullsize/';
          type = 'fullsize';
        } else {
          reject({'error': 'no such folder'});
        }
        var message = {'type': type, 'result': true, 'path': prefix + filename + '.jpg'};
        resolve(message);
      } else {
        reject(err);
      }
    });
  });
}
router.route('/upload')
      .post(upload.single('photo'), function(req, res) {
        var saveThumb = savePhoto(thumbFolder, req.file.filename, {width: 350, height: 350});
        var saveFull = savePhoto(fullFolder, req.file.filename, {width: 1280, height: 600});
        var msg = {};
        Promise.all([saveThumb, saveFull]).then(function(objArr) {
          objArr.forEach(function(photo) {
            msg[photo.type] = photo.path;
          });
          res.json(msg);
        }).catch(function(err) {
          res.status(401).json({err: 'upload failed'});
        });
      });
router.route('/sse')
      .get(function(req ,res) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        res.write('retry: 1000\n');
        //res.flush();
        function pingClient() {
          res.write('\n\n');
          //res.flush();
        }

        ssePingInterval = setInterval(pingClient, 30000);
        //res.write('data: ' + JSON.stringify({ msg : 'hello world' })+ '\n\n');
        setInterval(function() {
          res.write("event: ping\n");
          res.write("data: hello world\n\n");
          //res.flush();
        }, 2000);
        /*messager.on('fetch', function(msg) {
          console.log(msg + '_____');
          res.write('data: ' + JSON.stringify({ msg : msg }) + '\n\n');
          res.flush();
        });*/
        res.on('close', function() {
          messager.removeAllListeners('fetch');
          clearInterval(ssePingInterval);
        });
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
