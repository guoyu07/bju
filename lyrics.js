var phantom = require('phantom');
function fetchLyric(id, callback) {
  phantom.create()
    .then(function(instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function(page) {
        sitepage = page;
        return page.open('http://music.163.com/#/song?id=' + id);
    })
    .then(function(status) {
      console.log('webpage status', status);
      //thi is a dummy way to wait the iframe page is ready
      //sending a 2.5s timeout
      //need a better way to do this
      setTimeout(function() {
        sitepage.evaluate(function() {
          var iframe = document.getElementById('g_iframe');
          var content = iframe.contentDocument.getElementById('lyric-content').innerHTML;
          var lyc = content.replace(/<div id=\"flag_more\".*?>|<\/div>|<div class=\"crl\">.*<\/a>/g, '');
          return lyc;
        }).then(function(lyc) {
          console.log('music163 inner HTML', lyc);
          callback(lyc);
          phInstance.exit();
        })
      }, 2500);

    })
    .catch(error => {
        console.error('error message here', error);
        phInstance.exit();
    });
};

exports.fetchLyric = fetchLyric;
