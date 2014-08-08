// 指定生成数据的原始数据目录
var path = '../hrSys/';

var nameResource = require('./name');
var staticData = require('./staticData');

var district = require(path + 'config/dataParse').districtName;
var jobTypeList = require(path + 'config/dataParse').jobType.local;
var db = require(path + 'routes/db');

// 速写方式
var random = Math.random;
var floor = Math.floor;
var countyId = getCountyId();
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

function updateRegisterId() {

}