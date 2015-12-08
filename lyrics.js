var phantom = require('phantom');
function fetchLyric(id, callback) {
  phantom.create(function(ph) {
    ph.createPage(function(page) {
      page.onConsoleMessage = function (msg, line, source) {
       console.log('console> ' + msg);
      };
      page.open('http://music.163.com/#/song?id=' + id, function(status) {
        console.log(status);
        if (status === 'success') {
          setTimeout(function() {
            page.evaluate(function() {
                //make sure the lyrics load in
                var iframe = document.getElementById('g_iframe');
                var content = iframe.contentDocument.getElementById('lyric-content').innerHTML;
                var esc = content.replace(/<div id=\"flag_more\".*?>|<\/div>|<div class=\"crl\">.*<\/a>/g, '');
                return esc;

            }, function(lyc) {
              callback(lyc);
              ph.exit();
            });
          }, 2000);
        };
      })
    })
  });
};

exports.fetchLyric = fetchLyric;
