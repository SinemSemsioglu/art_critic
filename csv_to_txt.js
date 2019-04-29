const fs = require('fs');
const parse = require('csv-parse');

// TODO ideally take filename as an argument
const text = fs.readFileSync('roberta_smith.csv', 'utf8'); 

const lines = text.split("\n");
console.log("number of lines " + lines.length);

var textFields = "";

// gets only the text field and concatenates
for(var l=1; l < lines.length; l++) {
    let line = lines[l];
    let fields = line.split(",");
    textFields += fields[4] + "\n";
};

fs.writeFileSync('roberta_smith_text.txt', textFields);