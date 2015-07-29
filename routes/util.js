var express = require('express');
var crypto = require('crypto');
var router = express.Router();

router.route('/upload')
      .post(function(req, res) {
        console.log(req.params);
      });

router.route('/fav')
      .post(function(req, res) {
        console.log(req.params);
      });

module.exports = router;
