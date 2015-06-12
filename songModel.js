var mongoose = require('mongoose');

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var SongSchema = new Schema({
	sid: Number,
	title: String,
	artist: String,
	pic: String,
	url: String,
  _creator: { type: String, ref: 'User' }
});

function Song(){
	this._Song = mongoose.model('Song', SongSchema);
}

Song.prototype.add = function(data, callback, fail) {
  callback = callback || function() {};
  fail = fail || function() {};
  this._Song.create(data, function(error, data) {
    if (!error) {
      callback(data);
    } else {
      fail(error);
    }
  });
}

Song.prototype.find = function(filter, callback) {
  this._Song.find(filter)
            .populate('_creator')
            .exec(function(error, data) {
                if (!error) {
                  callback(data);
                }
              }
            );
}

Song.prototype.delete = function(id, callback) {
  this._Song.remove({'_id': id}, function(error) {
    callback(error);
  });
}

exports.Song = new Song();
