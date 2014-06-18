var fs = require('fs');

//var path = __dirname + '/workRegisterId.csv';
function parseIdMap(path) {
    var idMap = {};

    if (fs.existsSync(path)) {
        var raw = fs.readFileSync(path, 'utf8');
        raw = raw.split('\r\n');

        for (var i = 0; i < raw.length; i++) {
            raw[i] = raw[i].split(',');
            if (raw[i][0] && /[\dxX]+/.test(raw[i][0])) {
                idMap[raw[i][0]] = raw[i][1];
            }
        }
    }
    return idMap;
}

function idMapName() {
    var idMap = {};
    var files;
    try {
        files = fs.readdirSync(__dirname + '/idMapName');
    } catch (e) {
        console.log('cannot get idMapName message.');
        return {};
    }

    for (var i = 0; i < files.length; i++) {
        idMap[files[i].slice(0, 8)] =
            parseIdMap(__dirname + '/idMapName/' + files[i]);
    }

    return idMap;
}

module.exports = {
    idMapName: idMapName(),
    securedLoan: parseIdMap(__dirname + '/securedLoan.csv'),
    workRegisterId: parseIdMap(__dirname + '/workRegisterId.csv'),
    skillVerification: parseIdMap(__dirname + '/skillVerification.csv'),
    startupTraining: parseIdMap(__dirname + '/startupTraining.csv'),
    vocationalTraining: parseIdMap(__dirname + '/vocationalTraining')
};

// only for test
/*
var tmp = idMapName();
var keys = Object.keys(tmp);
for (var i = 0; i < keys.length; i++) {
    console.log(keys[i] + ': ' + Object.keys(tmp[keys[i]]).slice(0, 5));
}
*/