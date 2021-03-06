var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var UserSchema = new Schema({
	name: String,
	avatar: String,
	password: String,
	admin: {type: Boolean, default: false},
	pubSongs: [{ type: String, ref: 'Song' }],
	favSongs: [{ type: String, ref: 'Song' }],
	pubCols: [{ type: String, ref: 'Collection' }],
	favCols: [{ type: String, ref: 'Collection' }]
});
function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}
function User(){
	this._User = mongoose.model('User', UserSchema);
}
User.prototype.find = function(filter, callback) {
	this._User.find(filter)
						.select('name avatar admin')
						.lean()
						.exec(function(err, data) {
							if (!err) {
								callback(false, data);
							} else {
								callback(true, err);
							}
						});
};
User.prototype.getInfo = function(name, callback) {
	var options = {name: name};
	this._User.findOne(options)
						.populate({
							path: 'pubSongs',
							select: '_id title artist'
						})
						.populate({
							path: 'favSongs',
							select: '_id title artist'
						})
						.exec(function(err, data) {
							if (!err) {
								callback(data);
							} else {
								console.error(err);
							}
						});
};

User.prototype.check = function(name, callback) {
	var options = {name: name};
	var callback = callback || function () {};
	this._User.find(options, function(error, userArr) {
		var data = {};
		if (!error) {
			if (Array.isArray(userArr) && userArr.length > 0) {
				data.exsitUser = true;
				data.pass = true;
				data.info = userArr[0];
			} else if (Array.isArray(userArr) && userArr.length === 0) {
				data.exsitUser = false;
				data.pass = true;
			} else {
				data.pass = false;
			}
			callback(data);
		}
	});
};

User.prototype.update = function(id, condition, callback) {
	var callback = callback || function() {};
	this._User.findByIdAndUpdate(id,
		condition,
		{safe: true, upsert: true},
		function(err, user) {
		if (!err) {
			callback(user);
		} else {
			console.log(err);
		}
	});
};

User.prototype.login = function(username, password, callback) {
	callback = callback || function() { }
	var options = {
		name: username,
		password: password
	};
	this._User.find(options, function(error, user) {
		var info = {};
		if (!error) {
			if (user.length > 0) {
				info = {
					status: 'success',
					msg: 'success login',
					data: user[0]
				};
			} else {
				info = {
					status: 'fail',
					msg: 'fail to login the server'
				}
			}

		}
		callback(info);
	})
}

User.prototype.create = function(data, callback) {
	callback = callback || function() {};
	var userData = {
		name: data.name,
		avatar: data.avatar,
		password: md5(data.password)
		//email: data.email
	};
	var _user = new this._User(userData);
	_user.save(function(error, data) {
		if (!error) {
			callback(data);
		}
	});
}



User.prototype.delete = function(id, callback) {
	callback = callback || function() {};
	this._User.findByIdAndRemove(id)
						.exec(function(err, data) {
							if (!err) {
								callback(data);
							} else {
								console.error(err);
							}
						})
}

exports.User = new User();
