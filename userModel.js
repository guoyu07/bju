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
User.prototype.login = function(username, password, callback) {
	callback = callback || function() { }
	var options = {
		username: username,
		password: password
	};
	this._User.find(options, function(error, user) {
		var info = {};
		if (!error) {
			info = {
				status: 'success',
				msg: 'success login',
				data: user
			};
		} else {
			info = {
				status: 'fail',
				msg: 'fail to login the server'
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

User.prototype.check = function(sid, callback) {
	var options = {sid: sid};
	this._User.find(options, function(error, user) {
		if (!error) {
			
		}
	});
} 

User.prototype.logout = function() {

}

exports.User = User;

