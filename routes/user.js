var user = require('../models/user').User;
var express = require('express');
var crypto = require('crypto');
var router = express.Router();

function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}

router.route('/users')
      .get(function(req, res) {

      })
      .post(function(req, res) {
        var data = req.params;
        user.create(data, function(data) {
          res.json(data);
        });
      });
router.route('/login')
      .post(function(req, res) {
        var data = req.params;
        user.login(data.username, md5(data.password), function(data) {
          res.json(data);
        })
      });
router.route('/user/:name')
      .get(function(req, res) {
        var name = req.params.name;
        user.getInfo(name, function(data) {
          res.json(data);
        })
      })
      .delete(function(req, res) {
        var name = req.params.name;
        user.delete(name, function(data) {
          res.json(data);
        })
      });

module.exports = router;
