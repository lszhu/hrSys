var fs = require('fs');
var xls = require('xlsjs');

var column = 'K';
//var file = './data/207.XLS';
var dir = './data';
var outputFilename = 'out.csv';

var data = collectData(dir, column);
console.log(data.length);
fs.writeFileSync(outputFilename, data.join('\r\n'));

function collectData(dir, column) {
    var files = fs.readdirSync(dir);
    //console.log(files);
    var data = [];
    var tmp;
    for (var i = 0; i < files.length; i++) {
        tmp = getColData(dir + '/' + files[i], column);
        //console.log(tmp);
        //data.concat(tmp);
        data.push(tmp.join(','));
        //console.log(data);
    }

    return data.join(',').split(',');
}

function getColData(filename, column) {
    var workbook = xls.readFile(filename);
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var rows = getRows(sheet['!ref']);
    var data = [];
    var value;
    for (var i = 0; i < rows; i++) {
        value = sheet[column + i];
        if (value && value.v > 1E15) {
            data.push(value.v);
        }
    }
    return data;
}


function getRows(ref) {
    var endPart = ref.split(':')[1];
    if (!endPart) {
        return 0;
    }
    for (var i = 0; i < endPart.length; i++) {
        if (parseInt(endPart.charAt(i)) >= 0) {
            return parseInt(endPart.slice(i));
        }
    }
    return 0;
}