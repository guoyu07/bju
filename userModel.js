var mongoose = require('mongoose');
var crypto = require('crypto');

var db = mongoose.connect("mongodb://localhost");

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var UserSchema = new Schema({
	name: String,
	avatar: String,
	password: String
	//email: String,
	//sid: String
});
function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}
function User(){
	this._User = mongoose.model('UserSchema', UserSchema);
}

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
}

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
	console.log(userData);
	var _user = new this._User(userData);
	_user.save(function(error, data) {
		if (!error) {
			callback(data);
		}
	});
}



User.prototype.logout = function() {

}

exports.User = new User();
