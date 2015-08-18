var fs = require('fs')
  , gm = require('gm');

/*gm('./uploads/1.jpg')
.size(function(err, size) {
    if (!err) {
        console.log(size);
    }
})*/

gm('./uploads/cover.jpg')
.resize(250, 250, '^')
.gravity('Center')
.crop(250, 250)
.write('./fullsize/3.jpg', function(err) {
    if (!err) console.log('done!');
});

