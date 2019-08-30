const _ = require('lodash');
const hound = require('hound');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

// 在 Linux 上，convert 命令就是 "convert"，而在 Windows 上，convert 命令是
// "magick convert"。
let MAGICK_CMD = process.env.MAGICK_CMD || "magick convert";

let debouncedGenThumbnail = _.debounce(genThumbnail, 1000);

if (process.argv.length !== 3) {
  console.error('Usage: node thumbnail-daemon.js <image-dir>');
  process.exit(1);
}

watcher = hound.watch(process.argv[2]);
 
watcher.on('create', function(file, stats) {
  console.log(file + ' was created');
  debouncedGenThumbnail(file);
})

watcher.on('change', function(file, stats) {
  console.log(file + ' was changed')
  debouncedGenThumbnail(file);
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

  if (!file.endsWith('-thumbnail.jpg') && file.match(/\.(jpg|jpeg|png|gif)$/i)) {
    console.log(file + ' thumbnail...');
    let thumbnail = file.substr(0, file.length - path.extname(file).length) + '-thumbnail.jpg';
    let cmd = `${MAGICK_CMD} -thumbnail 100x100 "${file}" "${thumbnail}"`; 
    exec(cmd).catch(error => {
      console.error(error);
    });
  }
}
