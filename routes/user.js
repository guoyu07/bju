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
        var data = req.body;
				console.log(data);
        user.create(data, function(data) {
          res.json(data);
        });
      });
router.route('/login')
      .post(function(req, res) {
        var data = req.body;
				var sess = req.session;
        user.login(data.username, md5(data.password + ''), function(data) {
					//generate the token
					var token = crypto.randomBytes(64).toString('hex');
					//save the token to server session
					sess.token = token;
					data.token = token;
          res.json(data);
        })
      });
router.route('/logout')
			.post(function(req, res) {
				var data = req.body;
				var sess = req.session;
				if (data.token === sess.token) {
					//clear the session
					delete sess.token;
					res.status(200).json({'msg': 'logout'});
				} else {
					res.status(401).json({'msg': 'invalid token'});
				}
			});
router.route('/checkuser/:name')
			.get(function(req, res) {
				var name = req.params.name;
				user.check(name, function(data){
					res.json(data);
				});
			});
router.route('/user/:name')
      .get(function(req, res) {
        var name = req.params.name;
				var authorization = req.headers['authorization'];
				var sess = req.session;
				switch (authorization) {
					default:
						return res.status(401).end('Please login to access this page');
					case 'Token token=expired':
						return res.status(401).end('Your token is expired');
					case 'Token token=' + sess.token:
						user.getInfo(name, function(data) {
		          res.json(data);
		        });
				};

      })
      .delete(function(req, res) {
        var name = req.params.name;
        user.delete(name, function(data) {
          res.json(data);
        })
      });

module.exports = router;
