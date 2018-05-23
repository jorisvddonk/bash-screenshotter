const puppeteer = require("puppeteer");
const Jimp = require("jimp");
const deepfry = require('./deepfry.js');

(async () => {
  const browser = await puppeteer.launch();
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
  const elements = await page.$$(".newquote");
  for (var i = 0; i < elements.length; i++) {
    var imgpath = `quote_${i}.png`;
    await elements[i].screenshot({path: imgpath}).then(function(buffer){
      return deepfry(buffer, imgpath.replace('png', 'jpg'));
    });
  }
  await browser.close();
})();
