const hound = require('hound');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const conf = require('../conf.json');

console.log('==================================================');
console.log('magick cmd', conf.magickCmd);
console.log('watch dir', conf.watchDir);
console.log('PATH env', process.env.PATH);
console.log('==================================================');

watcher = hound.watch(conf.watchDir);
 
watcher.on('create', function(file, stats) {
  console.log(file + ' was created');
  genThumbnail(file);
})

watcher.on('change', function(file, stats) {
  console.log(file + ' was changed')
  genThumbnail(file);
})
 
watcher.on('delete', function(file) {
  console.log(file + ' was deleted');
})

////////////////////////////////////////////////////////////////////////////////

/**
 * For a given file, if it's an image, create it's thumbnail as <file-without-ext>-thumbnail.jpg
 */
function genThumbnail(file) {
  // ignore tmp file (startsWith '~')
  if (path.basename(file).startsWith('~')) {
    return;
  }

  if (!file.endsWith('thumbnail.jpg') && file.match(/\.(jpg|jpeg|png|gif)$/i)) {
    console.log(file + ' thumbnail...');
    let thumbnail = file.substr(0, file.length - path.extname(file).length) + '-thumbnail.jpg';
    // the reason I append [0] to source file is so it will not generate a sequence of thumbnails for GIF animations.
    // for normal images, it has so side effect.
    let cmd = `${conf.magickCmd} -thumbnail 100x100 "${file}[0]" "${thumbnail}"`;
    exec(cmd).catch(error => {
      console.error(error);
    });
  }
}
