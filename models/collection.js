var mongoose = require('mongoose');
var showdown = require('showdown');
var crypto = require('crypto');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var CollectionSchema = new Schema({
	title: String,
	thumb: String,
	fullsize: String,
  desc: String,
	htmlDesc: String,
  date: String,
  _creator: { type: String, ref: 'User' },
	fans: [{type: String, ref: 'User'}],
  songs: [{type: String, ref: 'Song'}]
});
function md5(string) {
	var hash = crypto.createHash('md5').update(string).digest('hex');
	return hash;
}
function Collection(){
	this._Collection = mongoose.model('Collection', CollectionSchema);
}

function htmlspecialchars(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

Collection.prototype.create = function(data, callback) {
  callback = callback || function() {};
	if (data.desc) {
		var converter = new showdown.Converter();
		var html = converter.makeHtml(data.desc);
		data.htmlDesc = htmlspecialchars(html);
	}
  this._Collection.create(data, function(err, data) {
    if (!err) {
      callback(data);
    }
  });
}

Collection.prototype.update = function(data, callback) {
	callback = callback || function() {};
	var filter = {'_id': data.id};
	if (data.desc) {
		var converter = new showdown.Converter();
		var html = converter.makeHtml(data.desc);
		data.htmlDesc = htmlspecialchars(html);
	}
	this._Collection.findOneAndUpdate(filter, data, function(err, doc) {
		if (!err) {
			callback(false, doc);
		} else {
			callback(true, {});
		}
	});
}

Collection.prototype.updateFav = function(cid, data, callback) {
	callback = callback || function() {};
	var filter = {'_id': cid};
	this._Collection.findOneAndUpdate(filter,
		data,
		{safe: true, upsert: true},
		function(err, doc) {
			if (!err) {
				callback(false, doc);
			} else {
				callback(true, {});
			}
		});
}
Collection.prototype.find = function(filter, callback) {
  callback = callback || function() {};
  this._Collection.find(filter)
                  .populate({
                    path: '_creator',
                    select: '_id name avatar'
                  })
                  .populate({
                    path: 'fans',
                    select: '_id name'
                  })
                  /*.populate({
                    path: 'songs',
                    select: 'sid title artist _creator fans url pic'
                  })*/
                  .exec(function(err, data) {
                    if (!err) {
                        callback(data);
                    } else {
											console.error(err);
										}
                  });
}
Collection.prototype.findOne = function(id, callback) {
	callback = callback || function() {};
	this._Collection.findById(id)
									.populate({
										path: '_creator',
										select: '_id name avatar'
									})
									.populate({
										path: 'fans',
										select: '_id name avatar'
									})
									.populate({
										path: 'songs',
										select: 'sid title album artist _creator fans url pic'
									})
									.lean()
									.exec(function(err, data) {
										if (!err) {
											if (data._creator.avatar) {
												data._creator.avatarUrl = "http://www.gravatar.com/avatar/" + md5(data._creator.avatar) + "?s=70&d=retro";
											}
											callback(data);
										} else {
											console.error(err);
										}
									});
}
Collection.prototype.getNext = function(curId, callback) {
	callback = callback || function() {};
	var filter = {_id: {'$gt': curId}};
	this._Collection.find(filter).exec(function(err, data) {
		if (!err) {
			callback(false, data);
		}
	});
}
Collection.prototype.delete = function(id, callback) {
	callback = callback || function() {};
	this._Collection.findByIdAndRemove(id)
									.exec(function(err, data) {
										if (!err) {
											callback(data);
										} else {
											console.error(err);
										}
									})
}
exports.Collection = new Collection();
