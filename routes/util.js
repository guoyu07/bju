var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var multer  = require('multer');
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
        console.log(req.params);
      });

module.exports = router;
