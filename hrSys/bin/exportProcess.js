// access database
var db = require('../routes/db');

// data for make table
var createXlsx = require('../routes/table').createXlsx;

var fs = require('fs');

process.on('message', function(data) {
    var msg;
    if (data.hasOwnProperty('districtId')) {
        msg = data.districtId;
        if (msg == '0') {
            exportXlsx({});
        } else if (!isNaN(msg)) {
            msg = '^' + msg;
            exportXlsx({districtId: new RegExp(msg)});
        //} else if (msg.length < 10) {
        //    msg = '^' + msg;
        //    exportXlsx({districtId: new RegExp(msg)});
        //} else if (msg.length == 10) {
        //    exportXlsx({districtId: msg});
        } else {
            process.send({error: 'parameter error'});
        }
    } else if (data.hasOwnProperty('exit')) {
        process.exit(0);
    }
});

function exportXlsx(bound) {
    db.query(bound, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            process.send({error: 'Database error'});
            return;
        }
        var xlsx = createXlsx(data);
        process.send({processing: true});
        process.stdout.write(xlsx.toString('hex'));
        //console.log(xlsx.toString('hex'));
    });
}

process.on('disconnect', function() {
    process.exit(0);
});

//test function
function testExport(bound) {
    db.query(bound, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            process.send({error: 'Database error'});
            return;
        }
        var xlsx = createXlsx(data);
        fs.writeFileSync('tmp.xlsx', xlsx);
    });
}

//testExport({districtId: /^4311030412/});