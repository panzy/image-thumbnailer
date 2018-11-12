const express = require('express');
const fs = require('fs-extra');
const Jimp = require('jimp');
const mime = require('mime-types');
const path = require('path');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Get a image or it's thumbnail. */
router.get('/img/:filename', getImg);
router.get('/img/:d1/:filename', getD1Img);
router.get('/img/:d1/:d2/:filename', getD2Img);
router.get('/img/:d1/:d2/:d3/:filename', getD3Img);
router.get('/img/:d1/:d2/:d3/:d4/:filename', getD4Img);

module.exports = router;

////////////////////////////////////////////////////////////////////////////////
// implementations

/**
 * Max age for image resource, in seconds.
 */
const MAX_IMAGE_AGE_SEC = 31536000;

/**
 * Add a suffix to a filename.
 *
 * examples:
 *  filenameWithSuffix('foo.txt', '-1') -> 'foo-1.txt'
 *  filenameWithSuffix('foo/bar.txt', '-2') -> 'foo/bar-2.txt'
 */
function filenameWithSuffix(filename, suffix) {
  let ext = path.extname(filename);
  return path.join(path.dirname(filename), path.basename(filename, ext) + suffix + ext);
}

/**
 * Get image or it's thumbnail.
 *
 * supported query args:
 * - [w] thumbnail width;
 * - [h] thumbnail height;
 */
function getImg(req, res, next) {
  const defaultSize = 100;
  const IMAGES_DIR = process.env.IMAGES_DIR || path.join(__dirname, '..', 'external_images_dir');
  let h = parseInt(req.query.h) || Jimp.AUTO;
  let w = parseInt(req.query.w) || Jimp.AUTO;
  let originPath = path.join(IMAGES_DIR, req.params.filename);
  let thumbnailPath = path.join(IMAGES_DIR, filenameWithSuffix(req.params.filename, `-${w}x${h}`));

  // send original image
  if (h == Jimp.AUTO && w == Jimp.AUTO) {
    res.sendFile(originPath, {maxAge: MAX_IMAGE_AGE_SEC * 1000}, err => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.status(404).sendFile(path.join(__dirname, '..', 'assets', 'img-404.jpg'));
        } else {
          next(err);
        }
      }
    });
    return;
  }

  fs.readFile(thumbnailPath).then(data => {
    // send cached thumbnail file
    res.setHeader('content-type', mime.lookup(thumbnailPath));
    res.setHeader('Cache-Control', `public, max-age=${MAX_IMAGE_AGE_SEC}`);
    res.send(data);
  }, err => {
    // only ENOENT is expected
    if (err.code !== 'ENOENT')
      console.log(err);

    return fs.readFile(originPath).then(data => {
      // generate thumbnail with Jimp
      return Jimp.read(data)
        .then(img => {
          if (h == Jimp.AUTO && w == Jimp.AUTO) {
            if (img.bitmap.width > img.bitmap.height) {
              w = 100;
            } else {
              h = 100;
            }
          }

          if ((h !== Jimp.AUTO && h < img.bitmap.height) || (w !== Jimp.AUTO && w < img.bitmap.width)) {
            // resize, write file, and send
            return img.resize(w, h).quality(60).getBufferAsync(Jimp.MIME_JPEG).then(imgBuf => {
              fs.writeFile(thumbnailPath, imgBuf);
              res.set('content-type', Jimp.MIME_JPEG);
              res.setHeader('Cache-Control', `public, max-age=${MAX_IMAGE_AGE_SEC}`);
              res.send(imgBuf)
            });
          } else {
            // still send original image
            res.setHeader('content-type', mime.lookup(req.params.filename));
            res.setHeader('Cache-Control', `public, max-age=${MAX_IMAGE_AGE_SEC}`);
            return res.send(data);
          }
        });
    }, err => {
      if (err.code === 'ENOENT') {
        // original image is not found?
        res.status(404).sendFile(path.join(__dirname, '..', 'assets', 'img-404.jpg'));
      }
    });
  }).catch(err => {
    console.error(err);
    next(err);
  });
}

function getD1Img(req, res, next) {
  req.params.filename = path.join(req.params.d1, req.params.filename);
  return getImg(req, res, next);
}

function getD2Img(req, res, next) {
  req.params.filename = path.join(req.params.d1, req.params.d2, req.params.filename);
  return getImg(req, res, next);
}

function getD3Img(req, res, next) {
  req.params.filename = path.join(req.params.d1, req.params.d2, req.params.d3, req.params.filename);
  return getImg(req, res, next);
}

function getD4Img(req, res, next) {
  req.params.filename = path.join(req.params.d1, req.params.d2, req.params.d3, req.params.d4, req.params.filename);
  return getImg(req, res, next);
}
