const puppeteer = require("puppeteer");
const Jimp = require("jimp");
const deepfry = require("./deepfry.js");

module.exports = function(max, puppeteerOptions) {
  return new Promise(function(resolve, reject) {
    (async () => {
      const browser = await puppeteer.launch(puppeteerOptions);
      const page = await browser.newPage();
      await page.goto("http://bash.org/?random");

      /* Since puppeteer can only screenshot a single element and its children, and since Bash.org splits up entire quotes in two,
     we have to modify DOM such that every quote has a parent element we can then screenshot later on. */
      await page.evaluate(function() {
        var newQuotes = document.createElement("div");
        newQuotes.setAttribute("id", "newQuotes");
        document.querySelectorAll("center table td")[4].appendChild(newQuotes);
        var quotes = document.querySelectorAll(".quote");
        for (let quote of quotes) {
          var newquote = document.createElement("div");
          newquote.setAttribute("class", "newquote");
          var sib = quote.nextSibling;
          quote.remove();
          sib.remove();
          newquote.appendChild(quote);
          newquote.appendChild(sib);
          newQuotes.appendChild(newquote);
        }
      });

      /* Make screenshots of all quotes. Puppeteer can't screenshot elements in parallel, so we have to do this sequentially.
      Luckily, with `await` that's easy :D */
      var elements = await page.$$(".newquote");
      if (max) {
        elements = elements.slice(0, max);
      }
      var ss = await Promise.all(elements.map(function(element){
        return element.screenshot().then(function(buffer) {
          return deepfry(buffer);
        });
      }));
      await browser.close();
      resolve(ss);
    })();
  });
};
