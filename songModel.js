var mongoose = require('mongoose');

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var SongSchema = new Schema({
	sid: Number,
	title: String,
	artist: String,
	pic: String,
	url: String,
  _creator: { type: String, ref: 'User' },
	fans: [{type: String, ref: 'User'}]
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

Song.prototype.find = function(filter, pfilter, callback) {
  this._Song.find(filter)
            .populate({
							path: '_creator',
							match: pfilter
						})
						.populate({
							path: 'fans'
						})
            .exec(function(error, data) {
                if (!error) {
									data = data.filter(function(item){
										if (item._creator) {
											return item;
										}
									})
                  callback(data);
                }
              }
            );
}
Song.prototype.update = function(id, condition, callback) {
	callback = callback || function() {};

	this._Song.findByIdAndUpdate(id,
		condition,
		{safe: true, upsert: true},
		function(err, song) {
		if (!err) {
			callback(song);
		}
	});
}
Song.prototype.delete = function(id, callback) {
  this._Song.remove({'_id': id}, function(error) {
    callback(error);
  });
}

exports.Song = new Song();
