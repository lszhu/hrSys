// 指定生成数据的原始数据目录
var rootPath = '../hrSys/';

var nameResource = require('./name');
var staticData = require('./staticData');

var district = require(rootPath + 'config/dataParse').districtName;
var jobTypeList = require(rootPath + 'config/dataParse').jobType.local;
//var db = require(rootPath + 'routes/db');
// 导入xlsx文件分析库
var xlsx = require('xlsx');




///////////////////////////////////////////////////
// 工具函数

// get county Id from imported district Id
function getCountyId() {
    var city = district['4311'];
    for (var county in city) {
        if (city.hasOwnProperty(county)) {
            return county;
        }
    }
    // can not find exact county Id, return 0 indicate no bound
    return '0';
}

// 验证身份证号的合法性
function validIdNumber(idNumber) {
    if (idNumber.length != 18 || 12 < idNumber.slice(10, 12) ||
        idNumber.slice(6, 8) < 19 || 20 < idNumber.slice(6, 8)) {
        return false;
    }
    var weights = [
        '7', '9', '10', '5', '8', '4', '2', '1', '6',
        '3', '7', '9', '10', '5', '8', '4', '2', '1'
    ];
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        var digit = idNumber.charAt(i);
        if (isNaN(Number(digit))) {
            return false;
        }
        sum += digit * weights[i];
    }
    sum = (12 - sum % 11) % 11;
    return sum == 10 && idNumber.charAt(17).toLowerCase() == 'x' ||
        sum < 10 && sum == idNumber.charAt(17);
}

// 由身份证号得到年龄
function getAge(idNumber) {
    if (!validIdNumber(idNumber)) {
        return '';
    }
    var now = (new Date()).getFullYear();
    var year = idNumber.slice(6, 10);
    return now - year;
}

// 由身份证号得到性别
function getGender(idNumber) {
    if (!validIdNumber(idNumber)) {
        return '';
    }
    return idNumber.charAt(16) % 2 ? '男' : '女';
}

// 返回日期，格式：年-月-日
function getDate() {
    var t = new Date();
    var y = t.getFullYear();
    var m = t.getMonth() + 1;
    var d = t.getDate();
    return y + '年 ' + m + '月 ' + d + '日';
}

// 检查年份的合法性
function validYear(year) {
    if (!year) {
        return true;
    }
    return !isNaN(year) && 1900 < year && year < 2100;
}

// 检查电话的合法性
function validPhone(phone) {
    return !phone ||
        !isNaN(phone) && 6 < phone.length && phone.length < 13;
}

// 检查年月日的合法性，格式为：YYYYMMDD
function validDate(d) {
    if (!d) {
        return true;
    }
    if (d.slice(4, 6) == 2 && d.slice(6) > 28) {
        return false;
    }
    return d.length == 8 && !isNaN(d) && 19000000 < d &&
        d.slice(0, 4) < 2100 && d.slice(4, 6) < 13 && d.slice(6) < 32;
}

// 检查收入数目的合法性
function validSalary(salary) {
    return !isNaN(salary);
}

// 读取excel（xlsx）文件，分析返回数组，元素为人员信息条目
function parseExcel(filename, firstLine) {
    var start = firstLine ? firstLine : 7;
    var workbook = xlsx.readFile(filename);
    if (workbook.SheetNames.length > 1 || workbook.SheetNames.length == 0) {
        console.log(filename + '工作表有异常！');
        return;
    }
    var sheetName = workbook.SheetNames[0];
    console.log(filename + '有工作表：' + sheetName);
    var sheet = workbook.Sheets[sheetName];
    var range = sheet['!ref'].split(':')[1];
    if (range.slice(0, 2) != 'AX' || isNaN(range.slice(2))) {
        console.log(filename + '工作表有异常！');
        return;
    }
    var end = range.slice(2);
    var itemList = [];
    var item, j, tmp;
    var index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = start; i < end; i++) {
        item = [];
        for (j = 0; j < 26; j++) {
            tmp = sheet[index[j] + i];
            item[j] = tmp ? tmp.v : '';
        }
        for (j = 26; j < 50; j++) {
            tmp = sheet['A' + index[j - 26] + i];
            item[j] = tmp ? tmp.v : '';
        }
        itemList.push(item);
    }
    return itemList;
}

// 测试语句
console.log(parseExcel('excel/test.xlsx'));