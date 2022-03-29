const docGen = require('./dist/main');
const fs = require('fs');
const path = require('path');

docGen.buildApi().then(doc => {
    var json = JSON.stringify(doc, null, 2);
    fs.writeFile(path.join(__dirname, '..', 'swagger.json') , json, 'utf8', () => {
        console.log('Successfully wrote swagger.json to file.');
    })
});