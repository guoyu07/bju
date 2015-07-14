var request = require('request');
var qs = require('querystring');
var Promise = require('promise');
var cheerio = require('cheerio');
var id = process.argv[2];
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

function getSongInfo(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (!error) {
        var dict = JSON.parse(body);
        dict = dict.songs[0];
        var data = {
          'artist': dict.artists[0].name,
          'title': dict.name,
          'id': dict.id,
          'pic': dict.album.picUrl,
          'url': dict.mp3Url
        }
        resolve(data);
      } else {
        reject(error);
      }

    });
  });
};

function getLyric(data) {
  var artist = data.artist.replace(/\s/g, '_');
  var title = data.title.replace(/\s/g, '_');
  var options = {
    'uri': 'http://lyrics.wikia.com/' + artist + ':' + title + '',
    'method': 'GET'
  };
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);
        var html = $('.lyricbox').html();
        if (html) {
          html = html.replace(/<script>.*<\/script>|<div.*<\/div>|<!--[\s\S]*?-->/g, '');
          resolve(html);
        } else {
          reject(false);
        }
      } else {
        reject(error);
      }
    })
  });
};

getSongInfo(options).then(getLyric).then(function(data) {
  console.log(data);
});
