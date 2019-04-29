const mongoose = require('mongoose');

let articleSchema2 = new mongoose.Schema({
    author: String,
    url: String,
    text: String,
    dateCrawled: Date
});

let Article2 = mongoose.model('Article2', articleSchema2);

module.exports = Article2;