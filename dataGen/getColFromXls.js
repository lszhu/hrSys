var fs = require('fs');
var xls = require('xlsjs');

// 收集excel文件（.xls）的指定两列，保存到特定文件中（文件名与相应文件夹相同）
var colA = 'B';
var colB = 'C';
var firstRow = 7;
var rootDir = 'D:/Users/Jason/Documents/湖南省劳动力资源信息采集/祁阳数据/名单/';

batchCollect(rootDir);
//collectIdMapName('43112101');

function batchCollect(path) {
    var dirs = fs.readdirSync(path);
    for (var i = 0; i < dirs.length; i++) {
        collectIdMapName(dirs[i]);
    }
}

function collectIdMapName(dir) {
    var files = fs.readdirSync(rootDir + dir);
    var data = [];
    for (var i = 0; i < files.length; i++) {
        filterCols(dir + '/' + files[i], data);
    }
    fs.writeFileSync('./' + dir + '.csv', data.join('\r\n'));
}

function filterCols(path, data) {
    var workbook = xls.readFile(rootDir + path);
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var rows = getRows(sheet['!ref']);
    //console.log('rows: ' + rows);
    var name, idNumber;
    for (var i = firstRow; i <= rows; i++) {
        idNumber = sheet[colA + i];
        name = sheet[colB + i];
        if (name && idNumber && /[\dxX]{18}/.test(idNumber.v)) {
            data.push(idNumber.v + ',' + name.v);
        }
    }
}

/////////////////////////////////////////////////////////

// 找到excel文件（.xls）的指定列，收集所有文件的内容并保存到指定文件
//var column = 'K';
//var dir = './data';
//var outputFilename = 'out.csv';

//var data = collectData(dir, column);
//console.log(data.length);
//fs.writeFileSync(outputFilename, data.join('\r\n'));

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