

var request = require('request');
var qs = require('querystring');
exports.songDetail = function(id, callback) {
	var url = "http://music.163.com/api/song/detail/?id=" + id + "&ids=%5B" + id + "%5D";
	var headers = {
		'Cookie' : 'appver=1.5.0.75771;', 
		'Referer' : 'http://music.163.com'
	};

	var options = {
	    uri: url,
	    headers: headers,
	    method: 'GET'
	};

	request(options, function(error, response, body) {
	    var dict = JSON.parse(body);
	    dict = dict.songs[0];
	    var data = {
	    	'artist': dict.artists[0].name,
	    	'title': dict.name,
	    	'id': dict.id,
	    	'pic': dict.album.picUrl,
	    	'url': dict.mp3Url	    
	    }
	    callback(data);
	});
}

exports.doubanInfo = function(sid, callback) {
	var url = "https://www.douban.com/service/auth2/token";
	var postData = {
		client_id : '063b27283fc657df12b17578bf53079d',
		client_secret: 'bad73bda95cf322e',
		redirect_uri: 'http://localhost:4200/connect',
		grant_type: 'authorization_code',
		code: sid
	};
	var options = {
		uri: url,
		formData : postData,
		method: 'POST'
	}
	request(options, function(error, response, body) {
		if (!error) {
			var dict = JSON.parse(body);
			var token = dict.access_token;
			var options = {
				uri: 'https://api.douban.com/v2/user/~me',
				headers: {
					'Authorization': 'Bearer ' + token
				},
				method: 'GET'
			};
			request(options, function(error, response, body) {
				var dict = JSON.parse(body);
				callback(dict);
			});
		} else {
			console.error(error);
		}
	});

}
