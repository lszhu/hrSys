var fs = require('fs');

//var path = __dirname + '/workRegisterId.csv';
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
        files = fs.readdirSync(__dirname + '/idMapName', 'utf8');
    } catch (e) {
        console.log('cannot get idMapName message. error: ' + e);
        return {};
    }

    for (var i = 0; i < files.length; i++) {
        idMap[files[i].slice(0, 8)] =
            parseIdMap(__dirname + '/idMapName/' + files[i]);
    }

    return idMap;
}

function getMsgById(idNumber, districtId, staticData) {
    var msg = {};
    var value;
    var msgItem = [
        'workRegisterId', 'technicalGrade', 'publicWelfare',
        'socialSubsidy', 'startupTraining', 'vocationalTraining'
    ];
    for (var i = 0; i < msgItem.length; i++) {
        value = staticData[msgItem[i]][idNumber];
        if (value && value.trim()) {
            msg[msgItem[i]] = value.trim();
        }
    }

    if (staticData.securedLoan.hasOwnProperty(idNumber)) {
        msg['securedLoan'] = '';
    }

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
    idMapName: idMapName(),
    securedLoan: parseIdMap(__dirname + '/securedLoan.csv'),
    workRegisterId: parseIdMap(__dirname + '/workRegisterId.csv'),
    technicalGrade: parseIdMap(__dirname + '/technicalGrade.csv'),
    publicWelfare: parseIdMap(__dirname + '/publicWelfare'),
    socialSubsidy: parseIdMap(__dirname + '/socialSubsidy.csv'),
    startupTraining: parseIdMap(__dirname + '/startupTraining.csv'),
    vocationalTraining: parseIdMap(__dirname + '/vocationalTraining.csv'),
    getMsgById: getMsgById
};

// only for test
/*
var loan = parseIdMap(__dirname + '/securedLoan.csv');
var keys = Object.keys(loan).slice(-5, -1);
console.log(keys[3] + ':' + (loan[keys[0]] == ''));

var tmp = idMapName();
var keys = Object.keys(tmp);
for (var i = 0; i < keys.length; i++) {
    console.log(keys[i] + ': ' + Object.keys(tmp[keys[i]]).slice(0, 5));
}
*/