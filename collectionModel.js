var mongoose = require('mongoose');

var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectID;

var CollectionSchema = new Schema({
	title: String,
	pic: String,
  desc: String,
  date: String,
  _creator: { type: String, ref: 'User' },
	fans: [{type: String, ref: 'User'}],
  songs: [{type: String, ref: 'Song'}]
});

function Collection(){
	this._Collection = mongoose.model('Collection', CollectionSchema);
}

Collection.prototype.create = function(data, callback) {
  callback = callback || function() {};
  this._Collection.create(data, function(err, data) {
    if (!err) {
      callback(data)
    }
  })
}

Collection.prototype.find = function(filter, callback) {
  callback = callback || function() {};
  this._Collection.find(filter).
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
                    }
                  });
}

exports.Collection = new Collection();
