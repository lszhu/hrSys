var fs = require('fs');
var county = require('./config').county;
var dataPath = __dirname + '/staticData/' + county;
var districtId = require(dataPath + '/districtId');
var jobType = require(dataPath + '/jobType');

function parseIdMap(path) {
    var idMap = {};
    var raw;

    if (fs.existsSync(path)) {
        try {
            raw = fs.readFileSync(path, 'utf8');
        } catch (e) {
            console.log('cannot get idMapName message. error: ' + e);
            return {};
        }
        raw = raw.split('\r\n');

        for (var i = 0; i < raw.length; i++) {
            raw[i] = raw[i].split(',');
            if (raw[i][0] && /[\dxX]+/.test(raw[i][0])) {
                idMap[raw[i][0]] = (raw[i][1] ? raw[i][1] : '' );
            }
        }
    }
    return idMap;
}

function idMapName() {
    var idMap = {};
    var files;
    try {
        files = fs.readdirSync(dataPath + '/idMapName', 'utf8');
    } catch (e) {
        console.log('cannot get idMapName message. error: ' + e);
        return {};
    }

    for (var i = 0; i < files.length; i++) {
        idMap[files[i].slice(0, 8)] =
            parseIdMap(dataPath + '/idMapName/' + files[i]);
    }

    return idMap;
}

function getMsgById(idNumber, districtId, staticData) {
    var msg = {};
    var value, i;
    // 含有属性值的参数
    var msgItem = [
        'workRegisterId', 'technicalGrade',
        'startupTraining', 'vocationalTraining'
    ];
    for (i = 0; i < msgItem.length; i++) {
        value = staticData[msgItem[i]][idNumber];
        if (value && value.trim()) {
            msg[msgItem[i]] = value.trim();
        }
    }

    // 不含属性值的参数
    msgItem = [
        'publicWelfare', 'socialSubsidy', 'securedLoan', 'workRecommend',
        'orgMedicalInsurance', 'orgRetireInsurance', 'workInjuryInsurance',
        'unemployedInsurance', 'internship'
    ];
    // 将没有具体值的属性设置为空字符串
    for (i = 0; i < msgItem.length; i++) {
        value = msgItem[i];
        if (staticData[value].hasOwnProperty(idNumber)) {
            msg[value] = '';
        }
    }
//    if (staticData.publicWelfare.hasOwnProperty(idNumber)) {
//        msg[ 'publicWelfare'] = '';
//    }
//    if (staticData.socialSubsidy.hasOwnProperty(idNumber)) {
//        msg['socialSubsidy'] = '';
//    }
//    if (staticData.securedLoan.hasOwnProperty(idNumber)) {
//        msg['securedLoan'] = '';
//    }
//    if (staticData.workInjuryInsurance.hasOwnProperty(idNumber)) {
//        msg['workInjuryInsurance'] = '';
//    }
//    if (staticData.orgMedicalInsurance.hasOwnProperty(idNumber)) {
//        msg['orgMedicalInsurance'] = '';
//    }

    // 从相应数据文件由身份证号查询获取姓名
    var town = districtId.slice(0, 8);
    if (staticData.idMapName.hasOwnProperty(town)) {
        value = staticData.idMapName[town][idNumber];
        if (value && value.trim()) {
            msg['name'] = value.trim();
        }
    }

    return msg;
}

module.exports = {
    districtName: districtId,
    jobType: jobType,
    idMapName: idMapName(),
    securedLoan: parseIdMap(dataPath + '/securedLoan.csv'),
    workRegisterId: parseIdMap(dataPath + '/workRegisterId.csv'),
    technicalGrade: parseIdMap(dataPath + '/technicalGrade.csv'),
    publicWelfare: parseIdMap(dataPath + '/publicWelfare.csv'),
    socialSubsidy: parseIdMap(dataPath + '/socialSubsidy.csv'),
    workRecommend: parseIdMap(dataPath + '/workRecommend.csv'),
    internship: parseIdMap(dataPath + '/internship.csv'),
    startupTraining: parseIdMap(dataPath + '/startupTraining.csv'),
    vocationalTraining: parseIdMap(dataPath + '/vocationalTraining.csv'),
    workInjuryInsurance: parseIdMap(dataPath + '/workInjuryInsurance.csv'),
    unemployedInsurance: parseIdMap(dataPath + '/unemployedInsurance.csv'),
    orgMedicalInsurance: parseIdMap(dataPath + '/orgMedicalInsurance.csv'),
    orgRetireInsurance: parseIdMap(dataPath + '/orgRetireInsurance.csv'),
    getMsgById: getMsgById
};

// only for test
/*
 console.log(parseIdMap(dataPath + '/orgMedicalInsurance.csv'));
var loan = parseIdMap(dataPath + '/securedLoan.csv');
var keys = Object.keys(loan).slice(-5, -1);
console.log(keys[3] + ':' + (loan[keys[0]] == ''));

var tmp = idMapName();
var keys = Object.keys(tmp);
for (var i = 0; i < keys.length; i++) {
    console.log(keys[i] + ': ' + Object.keys(tmp[keys[i]]).slice(0, 5));
}
*/
