var express = require('express');
var crypto = require('crypto');
var router = express.Router();

/*router.route('/upload')
      .post(upload.single('file'), function(req, res) {
        console.log(req.file);
      });*/

router.route('/fav')
      .post(function(req, res) {
        console.log(req.params);
      });

module.exports = router;
