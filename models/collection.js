var mongoose = require('mongoose');
var showdown = require('showdown');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var CollectionSchema = new Schema({
	title: String,
	thumb: String,
	fullsize: String,
  desc: String,
  date: String,
  _creator: { type: String, ref: 'User' },
	fans: [{type: String, ref: 'User'}],
  songs: [{type: String, ref: 'Song'}]
});

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
		data.desc = htmlspecialchars(html);
	}
  this._Collection.create(data, function(err, data) {
    if (!err) {
      callback(data);
    }
  })
}

Collection.prototype.find = function(filter, callback) {
  callback = callback || function() {};
  this._Collection.find(filter)
                  .populate({
                    path: '_creator',
                    select: '_id name'
                  })
                  .populate({
                    path: 'fans',
                    select: '_id name'
                  })
                  .populate({
                    path: 'songs',
                    select: 'sid title artist _creator fans url pic'
                  })
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
										select: '_id name'
									})
									.populate({
										path: 'fans',
										select: '_id name'
									})
									.populate({
										path: 'songs',
										select: 'sid title artist _creator fans url pic'
									})
									.exec(function(err, data) {
										if (!err) {
											callback(data);
										} else {
											console.error(err);
										}
									});
}
exports.Collection = new Collection();
