const fs = require('fs');
const Jimp = require('jimp');

const darkennoise = function (x, y, idx) {
  if (Math.random() > 0.7) {
    var v = Math.random() * 60;
    this.bitmap.data[idx+0] = Math.max(this.bitmap.data[idx+0] - v, 0);
    this.bitmap.data[idx+1] = Math.max(this.bitmap.data[idx+1] - v, 0);
    this.bitmap.data[idx+2] = Math.max(this.bitmap.data[idx+2] - v, 0);
  }
};

const colorednoise = function (x, y, idx) {
  if (Math.random() > 0.95) {
    this.bitmap.data[idx]   = Math.max(128, Math.floor(Math.random() * 255));
    this.bitmap.data[idx+1] = Math.max(128, Math.floor(Math.random() * 255));
    this.bitmap.data[idx+2] = Math.max(128, Math.floor(Math.random() * 255));
  }
}

module.exports = function(buffer, imgpath) {
  if (typeof buffer == 'string') {
    buffer = fs.readFileSync(buffer);
  }
  return new Promise(function(resolve, reject) {
    Jimp.read(buffer, function(err, img) {
      if (err) {
        reject(err);
      } else {
        new Jimp(
          img.bitmap.width + 20,
          img.bitmap.height + 20,
          0xffffffff,
          function(err, image) {
            if (err) {
              reject(err);
            } else {
              image.blit(img, 10, 10);
              image.contrast(0.3);
              image.color([{ apply: "saturate", params: [30] }]);
              image.scan(0, 0, image.bitmap.width, image.bitmap.height, darkennoise);
              image.scan(0, 0, image.bitmap.width, image.bitmap.height, colorednoise);
              image.normalize();
              image.quality(20);
              image.scale(2, Jimp.RESIZE_HERMITE);
              image.write(imgpath.replace("png", "jpg"));
              resolve();
            }
          }
        );
      }
    });
  });
};
