var get_bash_screenshots = require("./index.js");
var fs = require("fs");
get_bash_screenshots()
  .then(function(results) {
    return Promise.all(
      results.map(function(result, i) {
        return new Promise(function(resolve, reject) {
          fs.writeFile(`quote_${i}.jpg`, result, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      })
    );
  })
  .catch(console.error);
