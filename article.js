const $ = require('jquery');

module.exports = function() {
    return new Promise((resolve, reject) => {

        const TEXT_CONTAINER = ".StoryBodyCompanionColumn";
        const TEXT_ELEMENT = "p";

        function getArticleText() {
            var text = "";
            var articleContainers = Array.from($(TEXT_CONTAINER));
            
            articleContainers.forEach(function(container) {
                var ps = Array.from($(container).find(TEXT_ELEMENT));

                ps.forEach(function(p) {
                    text += $(p).html();
                });
            });

            resolve(text);
        }
      
        getArticleText();
    });
}