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
            insurance.push(table.cnInsurance[i]);
        }
    }
    var postService = [];
    for (i = 0; i < table.cnService.length; i++) {
        if (req.body['postService' + i]) {
            postService.push(table.cnService[i]);
        }
    }
    var preferredService = [];
    for (i = 0; i < table.cnService.length; i++) {
        if (req.body['preferredService' + i]) {
            preferredService.push(table.cnService[i]);
        }
    }
    var preferredJobType = [];
    for (i = 0; i < table.cnJobType.length; i++) {
        if (req.body['preferredJobType' + i]) {
            preferredJobType.push(table.cnJobType[i]);
        }
    }
    var jobType = [];
    for (i = 0; i < table.cnJobType.length; i++) {
        if (req.body['jobType' + i]) {
            jobType.push(table.cnJobType[i]);
        }
    }

    var userMessage = {
        // basic info
        username: req.body.username,
        idNumber: req.body.idNumber,
        nation: req.body.nation,
        // readonly basic info
        age: req.body.age,
        gender: req.body.gender,
        workRegisterId: req.body.workRegisterId,
        address: req.body.address,
        districtId: req.body.districtId,
        // still basic info
        education: req.body.education,
        graduateDate: req.body.graduateDate,
        phone: req.body.phone,
        censusRegisterType: req.body.censusRegisterType,
        politicalOutlook: req.body.politicalOutlook,
        marriage: req.body.marriage,
        // training and service info
        trainingType: req.body.trainingType,
        postTraining: req.body.postTraining,
        technicalGrade: req.body.technicalGrade,
        postService: postService,
        extraPostService: req.body.extraPostService,
        // employment/unemployment switch
        employment: req.body.employment,
        // employment info
        employmentInfo: {
            employer: req.body.employer,
            jobType: jobType,
            industry: req.body.industry,
            startWorkDate: req.body.startWorkDate,
            workplace: req.body.workplace,
            workProvince: req.body.workProvince,
            salary: req.body.salary,
            jobForm: req.body.jobForm
        },
        // unemployment info
        unemploymentInfo: {
            humanCategory: req.body.humanCategory,
            unemployedDate: req.body.unemployedDate,
            unemploymentCause: req.body.unemploymentCause,
            familyType: req.body.familyType,
            preferredJobType: preferredJobType,
            extraPreferredJobType: req.body.extraPreferredJobType,
            preferredSalary: req.body.preferredSalary,
            preferredIndustry: req.body.preferredIndustry,
            preferredWorkplace: req.body.preferredWorkplace,
            preferredJobForm: req.body.preferredJobForm,
            preferredService: preferredService,
            extraPreferredService: req.body.extraPreferredService,
            preferredTraining: req.body.preferredTraining
        },
        // insurance info
        insurance: insurance,
        // editor info
        editor: req.body.editor,
        modifiedDate: new Date()
    };
    // this attribute is used only for control. and is not saved to DB
    userMessage.administrator = req.session.user;
    db.preprocessUserMsg(userMessage);
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
            tables: table.cnTableName
        }
    );
});

/* show statistics table page. */
router.post('/tables', function(req, res) {
    var area = req.body.area;
    var tableName = req.body.table;
    var condition = {employment: '已就业'};
    if (area) {
        condition.address = new RegExp(area);
    }
    db.query(condition, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            res.render('error', {title: 'Database error, try again later.'});
            return;
        }
        //table.dataTranslate(data);
        debug('data translated: ' + data.length);
        res.render(
            'tableEmployed',
            {
                title: table.cnTableName[tableName],
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
