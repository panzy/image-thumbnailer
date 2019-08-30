const _ = require('lodash');
const hound = require('hound');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

let MAGICK_CMD = null;

determineMagickCmd().then(cmd => {
  console.log('determined ImageMagick command name:', cmd);
  MAGICK_CMD = cmd;
}).catch(error => {
  console.error('Error: failed to determine ImageMagick command name, have you installed it?');
  process.exit(1);
});

let debouncedGenThumbnail = _.debounce(genThumbnail, 1000);

if (process.argv.length !== 3) {
  console.error('Usage: node thumbnail-daemon.js <image-dir>');
  process.exit(1);
}

watcher = hound.watch(process.argv[2]);
 
watcher.on('create', function(file, stats) {
  console.log(file + ' was created');
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
 * 在 Linux 上，convert 命令就是 "convert"，而在 Windows 上，convert 命令是
 * "magick convert"。
 *
 * 这个函数会返回当前系统上可用的命令。
 */
function determineMagickCmd() {
  let cmd = "(type magick >/dev/null 2>&1 && echo 'magick convert') || (type convert >/dev/null 2>&1 && echo 'convert')";
  return exec(cmd).then(o => o.stdout.trim());
}

/**
 * For a given file, if it's an image, create it's thumbnail as <file>.thumbnail.jpg
 */
function genThumbnail(file) {
  if (!MAGICK_CMD) {
    console.warn('MAGICK_CMD is not determined.');
    return;
  }

  // ignore tmp file (startsWith '~')
  if (path.basename(file).startsWith('~')) {
    return;
  }

  if (!file.endsWith('.thumbnail.jpg') && file.match(/\.(jpg|jpeg|png|gif)$/i)) {
    console.log(file + ' thumbnail...');
    let thumbnail = file + '.thumbnail.jpg';
    let cmd = `${MAGICK_CMD} -thumbnail 100x100 "${file}" "${thumbnail}"`; 
    exec(cmd);
  }
}
