const fs = require('fs');
const parse = require('csv-parse');

// TODO ideally take filename as an argument
const text = fs.readFileSync('roberta_smith.json', 'utf8'); 

const lines = text.split("\n");
console.log("number of lines " + lines.length);

var textFields = "";

// gets only the text field and concatenates
for(var l=0; l < lines.length; l++) {
    console.log("processing line " + l);
    let line = lines[l];
    let lineObj = JSON.parse(line);
    textFields += lineObj.text + "\n";
};

fs.writeFileSync('roberta_smith_json_text.txt', textFields);