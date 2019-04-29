const $ = require('jquery');

// reference:  https://medium.com/@eyasu.kifle/scraping-infinite-list-pagination-8b47d691c497

module.exports = function() {
    return new Promise((resolve, reject) => {
        const NUM_TOTAL_ARTICLES = "";

        const ARTICLE_LIST = "section#latest-panel > div.stream > ol.story-menu.initial-set";
        const ARTICLE_ELEMENT = "li";
        const LINK_ELEMENT = "a.story-link";
        const HREF_ATTR = "href";
        const ELEMENTS_TO_REMOVE_CLASS = "elements-to-remove";

        let page = 1;

        // Global Set to store all entries
        let articleLinks = new Set(); // Eliminate dupes

        // Pause between pagination
        const PAUSE = 4000;

        // Scrapes one article element to get the link
        function scrapeSingleArticle(articleElement) {
            try {
                articleLinks.add($(articleElement).find(LINK_ELEMENT).attr(HREF_ATTR));
            } catch (e) {
                console.error("Error capturing individual article link", e);
            }
            
        }

        // Get all articles in the visible context
        function scrapeArticles() {
            console.log("Scraping page");

            var articlesList = $(ARTICLE_LIST)[0];
            var visibleArticles = $(articlesList).find(ARTICLE_ELEMENT);
            console.log(visibleArticles);
            
            if (visibleArticles.length > 0) {
                console.log("... found " + visibleArticles.length + " articles");
                Array.from(visibleArticles).forEach(scrapeSingleArticle);
            } else {
                console.warn("... found no articles");
            }

            // Return master list of threads;
            return visibleArticles.length;
        }
        

        // Clears the list between pagination to preserve memory
        // Otherwise, browser starts to lag after about 1000 threads
        function clearList() {
            console.log("Clearing list page " + page);

            try {
                // Remove threads previously marked for removal
                $('.' + ARTICLES_TO_REMOVE_CLASS + "-" + (page -1)).remove();

                // Mark visible threads for removal on next iteration
                $(ARTICLE_LIST).find('li').addClass(ARTICLES_TO_REMOVE_CLASS + "-" + page);

            } catch (e) {
                console.error("Unable to remove elements", e.message)
            }
        }

        function markCurrentElementsForRemoval() {
             // Mark visible threads for removal on next iteration
             $(ARTICLE_LIST).find('li').addClass(ELEMENTS_TO_REMOVE_CLASS);
        }

        function removeMarkedElements() {
            // Remove threads previously marked for removal
            $('.' + ELEMENTS_TO_REMOVE_CLASS).remove();
        }

        // Scrolls to the bottom of the viewport
        function loadMore () {
            console.log("Load more... page" + page);
            window.scrollTo(0, document.body.scrollHeight);
        }

        // Recursive loop that ends when there are no more threads
        function loop () {
            console.log("Looping... " + articleLinks.size + " entries added");
            if (scrapeAdditionalArticles()) {
                try {
                    clearList();
                    loadMore();
                    page++;
                    setTimeout(loop, PAUSE)
                } catch (e) {
                    reject(e);
                }
            } else {
                console.timeEnd("Scrape");
                resolve(Array.from(articleLinks));
            }
        }

        function getArticleLinks () {
            removeMarkedElements();
            scrapeArticles();
            markCurrentElementsForRemoval();
            console.log(articleLinks.size + " entries added");
            page++;
            resolve(Array.from(articleLinks));
        }

        getArticleLinks();
    });
}