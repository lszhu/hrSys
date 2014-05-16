var express = require('express');
var router = express.Router();
var util = require('util');

// temp accounts
var auth = require('./auth').auth;

/* GET home page. */
router.get('/', function(req, res) {
    console.log("session: " + util.inspect(req.session));
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
    console.log(acc);
    console.log("session: " + util.inspect(req.session));
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
    //res.write('username: ' + req.body.username);
    //res.end('IdNumber: ' + req.body.idNumber);
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
        auditor: req.body.auditor
    };
    var insurance = {
        a: req.body.insurance0,
        b: req.body.insurance1,
        c: req.body.insurance2,
        d: req.body.insurance3,
        e: req.body.insurance4,
        f: req.body.insurance5,
        g: req.body.insurance6
    };
    var workPlace = {
        a: req.body.workPlace0,
        b: req.body.workPlace1,
        c: req.body.workPlace2,
        d: req.body.workPlace3,
        e: req.body.workPlace4,
        f: req.body.workPlace5,
        g: req.body.workPlace6
    };
    var jobType = {
        a: req.body.jobType0,
        b: req.body.jobType1,
        c: req.body.jobType2,
        d: req.body.jobType3,
        e: req.body.jobType4,
        f: req.body.jobType5,
        g: req.body.jobType6,
        h: req.body.jobType7,
        i: req.body.jobType8,
        j: req.body.jobType9,
        k: req.body.jobType10,
        l: req.body.jobType11,
        m: req.body.jobType12,
        n: req.body.jobType13,
        o: req.body.jobType14,
        p: req.body.jobType15,
        q: req.body.jobType16,
        r: req.body.jobType17,
        s: req.body.jobType18,
        t: req.body.jobType19,
        u: req.body.jobType20,
        v: req.body.jobType21
    };
    var industry = {
        a: req.body.industry0,
        b: req.body.industry1,
        c: req.body.industry2,
        d: req.body.industry3,
        e: req.body.industry4,
        f: req.body.industry5,
        g: req.body.industry6,
        h: req.body.industry7,
        i: req.body.industry8,
        j: req.body.industry9,
        k: req.body.industry10,
        l: req.body.industry11,
        m: req.body.industry12,
        n: req.body.industry13
    };
    var preferredTraining = {
        a: req.body.preferredTraining0,
        b: req.body.preferredTraining1,
        c: req.body.preferredTraining2,
        d: req.body.preferredTraining3,
        e: req.body.preferredTraining4,
        f: req.body.preferredTraining5,
        g: req.body.preferredTraining6,
        h: req.body.preferredTraining7,
        i: req.body.preferredTraining8,
        j: req.body.preferredTraining9,
        k: req.body.preferredTraining10,
        l: req.body.preferredTraining11,
        m: req.body.preferredTraining12,
        n: req.body.preferredTraining13,
        o: req.body.preferredTraining14
    };
    res.render('editResponse', {
        userMessage: userMessage,
        insurance: insurance,
        workPlace: workPlace,
        jobType: jobType,
        industry: industry,
        preferredTraining: preferredTraining
    });
});

/* statistics page. */
router.get('/statistics', function(req, res) {
    res.render('statistics', { title: 'statistics' });
});

/* statistics page. */
router.post('/statistics', function(req, res) {
    res.render('index', { title: 'statistics' });
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
    //console.log(req.session);
    res.redirect('/login');
    //res.render('index', { title: 'logout' });
});

module.exports = router;
