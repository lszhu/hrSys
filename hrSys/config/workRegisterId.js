var fs = require('fs');

var workRegisterId = {};
var raw = fs.readFileSync(__dirname + '/workRegisterId.csv', 'utf8');
raw = raw.split('\r\n');
for (var i = 0; i < raw.length; i++) {
    raw[i] = raw[i].split(',');
    if (raw[i][0] && /[\dxX]+/.test(raw[i][0])) {
        workRegisterId[raw[i][0]] = raw[i][1];
    }
}

module.exports = workRegisterId;