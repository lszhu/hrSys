// access database
var db = require('../routes/db');

// data for make table
var createXlsx = require('../routes/table').createXlsx;

process.on('message', function(data) {
    var msg;
    if (data.hasOwnProperty('districtId')) {
        msg = data.districtId;
        if (msg == '0') {
            exportXlsx({});
        } else if (msg.length < 10) {
            msg = '^' + msg;
            exportXlsx({districtId: new RegExp(msg)});
        } else if (msg.length == 10) {
            exportXlsx({districtId: new RegExp(msg)});
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