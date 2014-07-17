var fs = require('fs');
var xlsx = require('xlsjs');

var file = './data/207.XLS'
var workbook = xlsx.readFile(file);
var sheet = workbook.Sheets[workbook.SheetNames[0]];