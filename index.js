const puppeteer = require('puppeteer')
const articleListScript = require('./article_list');
const articleScript = require('./article');
const fs = require("fs");

const mongoose = require('mongoose');
const Article = require('./models/article_schema');
const Article2 = require('./models/article_schema_2');

// reference: https://medium.com/@e_mad_ehsan/getting-started-with-puppeteer-and-chrome-headless-for-web-scrapping-6bf5979dee3e

const RESULTS_FILE_PATH = "results_holland_2.json";
var numPage = 0;

function save(raw) {
   fs.writeFileSync(RESULTS_FILE_PATH, JSON.stringify(raw));
}

function append(raw, filehandle) {
  fs.promises.appendFile(filehandle, "\"page-" + numPage + "\": " + JSON.stringify(raw) + ",");
  numPage++;
}


const URL = 'https://www.nytimes.com/by/holland-cotter';
const SHOW_MORE_BUTTON = "#latest-panel > div.stream > div.story-menu-options > div.buttons > button.load-more-button";
// Pause between pagination
const PAUSE = 2000;



(async () => {
  const filehandle = await fs.promises.open(RESULTS_FILE_PATH, 'a');
  fs.promises.appendFile(filehandle, "{");

  const browser = await puppeteer.launch({
    //headless: false
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));
  
  await page.goto(URL);
  
  await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
  
  await page.click(SHOW_MORE_BUTTON);
  
  var getMoreArticles = async(threads) => {
    if (threads.length > 0) {
      append(threads, filehandle);
      await page.click(SHOW_MORE_BUTTON);
      threads = await page.evaluate(articleListScript);
      await getMoreArticlesHelper(threads);
    } else {
      console.log("at the end of page");
      return;
    }
  }

  var getMoreArticlesHelper = (threads) => {
    return new Promise((resolve) => {
      setTimeout(async() => {
        await getMoreArticles(threads);
        resolve();
      }, PAUSE);
    });
  }

  _threads = await page.evaluate(articleListScript);
  await getMoreArticles(_threads);
  
  // TODO close file for appending (need to check if getMoreArticles is done)
  console.log(numPage + " pages processed");
  await fs.promises.appendFile(filehandle, "\"dummy\": []}");
  await filehandle.close();
  
  // TODO read file as json obj, get urls as array
  const links = JSON.parse(await fs.promises.readFile(RESULTS_FILE_PATH));
  // TODO loop through array call article script for each
  var pages = Object.keys(links);
  var numPages = pages.length;
  console.log("number of pages is " + numPages);
  for (let p = 0; p <= numPages; p++) {
    let pageLinks = links[pages[p]];
    let numLinks = pageLinks.length;
    
    for(let l = 0; l < numLinks; l++) {
      let pageUrl = pageLinks[l];

      if (pageUrl != null) {
        await page.goto(pageUrl);
        await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})

        let articleText = await page.evaluate(articleScript);
        console.log("got article text for page number " + p + " link number " + l);
        // TODO save the text of each article to the db (url + text)?
        upsertArticle2({
          author: "Holland Cotter", // TODO get this as an article
          url: pageUrl,
          text: articleText,
          dateCrawled: new Date()
        });
      }
    }
  }
  
   await browser.close();
})();

function upsertArticle2(articleObj) {
	
	const DB_URL = 'mongodb://localhost/art_scraper';

  	if (mongoose.connection.readyState == 0) { mongoose.connect(DB_URL); }

    // if this url exists, update the entry, don't insert
	  let conditions = { url: articleObj.url };
	  let options = { upsert: true, new: true, setDefaultsOnInsert: true };

  	Article2.findOneAndUpdate(conditions, articleObj, options, (err, result) => {
  		if (err) throw err;
  	});
}