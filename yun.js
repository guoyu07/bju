var request = require('request');
var qs = require('querystring');
var Promise = require('promise');
var lyrics = require('./lyrics');
var messager = require('./utils/publish');
function htmlspecialchars(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function htmlspecialchars_decode(str) {
    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'');
}

function getSongInfo(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      messager.emit('fetch', 'already finish fetching song info');
      if (!error) {
        var dict = JSON.parse(body);
        if (dict.code * 1 === 200 ) {
          if (dict.songs.length > 0) {
            dict = dict.songs[0];
            var data = {
              'artist': dict.artists[0].name,
              'title': dict.name,
              'id': dict.id,
              'pic': dict.album.picUrl,
              'url': dict.mp3Url,
              'album': dict.album.name,
              'pass': true
            }
            resolve(data);
          } else {
            var data = {
              message: 'this id doesn\'t exsits ',
              pass: false
            }
            resolve(data);
          }

        } else {
          var data = {
            message: 'invalid id format',
            pass: false
          };
          resolve(data);
        }


      } else {
        reject(error);
      }

    });
  });
};

function getLyric(data) {

  if (data.pass) {

    return new Promise(function(resolve, reject) {
      /*request(options, function(error, response, body) {
        if (!error) {
          var $ = cheerio.load(body);
          var html = $('.lyricbox').html();
          if (html) {
            html = html.replace(/<script>.*<\/script>|<div.*<\/div>|<!--[\s\S]*?-->/g, '');
  					escape = htmlspecialchars(html);
  					data.lyrics = escape;
            resolve(data);
          } else {
            resolve(data);
          }
        } else {
          reject(error);
        }
      })*/
      messager.emit('fetch', 'start fetching lyrics from 163.com');
      //using phantom js to fetch the lyrics from 163.com
      lyrics.fetchLyric(data.id, function(lyc) {
        if (lyc != '') {
          messager.emit('fetch', 'finish fetching the lyrics data');
          escape = htmlspecialchars(lyc);
          data.lyrics = escape;
          resolve(data);
        } else {
          reject('no lyrics fetched');
        }
      });
    });
  } else {
    return Promise.resolve(data);
  }

};

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
  console.log(messager._events.fetch);
  messager.emit('fetch', 'begin fetch');
	getSongInfo(options).then(getLyric).then(function(data) {
		callback(false, data);
	}, function(error) {
		callback(true, {});
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
