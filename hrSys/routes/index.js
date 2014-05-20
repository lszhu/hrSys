var express = require('express');
var router = express.Router();
var util = require('util');

// for debug
var debug = require('debug')('route');

// data for make table
var table = require('./table');
// account authentication
var auth = require('./auth').auth;
// access database
var db = require('./db');

/* GET home page. */
router.get('/', function(req, res) {
    debug("session: " + util.inspect(req.session));
    res.render('index', { title: 'Express' });
});

/* login page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'login' });
});

/* login page. */
router.post('/login', function(req, res) {
    //res.render('index', { title: 'login' });
    acc = {
        username: req.body.username,
        password: req.body.password
    };
    debug(acc);
    debug("session: " + util.inspect(req.session));
    if (auth(acc)) {
        req.session.user = acc.username;
        req.session.error = undefined;
        res.redirect('/');
    } else {
        res.render('login', {error: '用户名或密码错误！'})
    }
    //res.end('auth ok');
});

/* administration page. */
router.get('/admin', function(req, res) {
    res.render('admin', { title: 'administration' });
});

/* administration page. */
router.post('/admin', function(req, res) {
    res.render('index', { title: 'administration' });
});

/* add/modify item page. */
router.get('/item', function(req, res) {
    res.render('item', { title: 'add/modify item' });
});

/* add/modify page. */
router.post('/item', function(req, res) {
    var insurance = [];
    for (var i = 0; i < table.cnInsurance.length; i++) {
        if (req.body['insurance' + i]) {
            insurance.push(i);
        }
    }
    var workPlace = [];
    for (i = 0; i < table.cnWorkPlace.length; i++) {
        if (req.body['workPlace' + i]) {
            workPlace.push(i);
        }
    }
    var jobType = [];
    for (i = 0; i < table.cnJobType.length; i++) {
        if (req.body['jobType' + i]) {
            jobType.push(i);
        }
    }
    var industry = [];
    for (i = 0; i < table.cnIndustry.length; i++) {
        if (req.body['industry' + i]) {
            industry.push(i);
        }
    }
    var preferredTraining = [];
    for (i = 0; i < table.cnPreferredTraining.length; i++) {
        if (req.body['preferredTraining' + i]) {
            preferredTraining.push(i)
        }
    }
    var userMessage = {
        username: req.body.username,
        idNumber: req.body.idNumber,
        nation: req.body.nation,
        marriage: req.body.marriage,
        address: req.body.address,
        phone: req.body.phone,
        education: req.body.education,
        employment: req.body.employment,
        workTrend: req.body.workTrend,
        jobPreference: req.body.jobPreference,
        project: req.body.project,
        salary: req.body.salary,
        workExperience: req.body.workExperience,
        technicalGrade: req.body.technicalGrade,
        trainingStatus: req.body.trainingStatus,
        postTraining: req.body.postTraining,
        editor: req.body.editor,
        auditor: req.body.auditor,
        insurance: insurance,
        industry: industry,
        jobType: jobType,
        workPlace: workPlace,
        preferredTraining: preferredTraining,
        modifiedDate: new Date()
    };
    db.save(userMessage);
    res.render('editResponse', {userMessage: userMessage});
});

/* prepare statistics table page, ask for search parameters. */
router.get('/tables/:title', function(req, res) {
    debug('tables: ' + util.inspect(table.tablesName));
    debug('title: ' + req.param('title'));
    res.render(
        'statistics',
        {
            tableName: req.param('title'),
            tables: table.cnName
        }
    );
});

/* show statistics table page. */
router.post('/tables', function(req, res) {
    var area = req.body.area;
    var tableName = req.body.table;
    var condition = {};
    if (area) {
        condition.address = new RegExp(area);
    }
    db.query(condition, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            res.render('error', {title: 'Database error, try again later.'});
            return;
        }
        table.dataTranslate(data);
        debug('data translated: ' + data.length);
        res.render(
            'table',
            {
                title: table.cnName[tableName],
                columns: table.columns[tableName],
                cnItemName: table.cnItemName,
                data: data
            }
        );
    });
});

/* search page. */
router.get('/search', function(req, res) {
    res.render('search', { title: 'search' });
});

/* search page. */
router.post('/search', function(req, res) {
    res.render('index', { title: 'search' });
});

/* help page. */
router.get('/help', function(req, res) {
    res.render('help', { title: 'search' });
});

/* logout page. */
router.all('/logout', function(req, res) {
    req.session.user = undefined;
    //req.session.error = "NoLogin";
    debug(req.session);
    res.redirect('/login');
    //res.render('index', { title: 'logout' });
});

module.exports = router;
