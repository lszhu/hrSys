var express = require('express');
var router = express.Router();
var util = require('util');

// for debug
var debug = require('debug')('route');

// data for make table
var table = require('./table');
// account authentication
var auth = require('./auth');
// access database
var db = require('./db');
// district Id and name
var districtName = require('../config/districtId');
// nations
var nations = [
    "汉族","蒙古族","回族","藏族","维吾尔族","苗族","彝族","壮族",
    "布依族","朝鲜族","满族","侗族","瑶族","白族","土家族","哈尼族",
    "哈萨克族","傣族","黎族","傈傈族","佤族","畲族","高山族","拉祜族",
    "水族","东乡族","纳西族","景颇族","柯尔克孜族","土族","达翰尔族",
    "仫佬族","羌族","布朗族","撒拉族","毛南族","仡佬族","锡伯族",
    "阿昌族","普米族","塔吉克族","怒族","乌孜别克族","俄罗斯族",
    "鄂温克族","德昂族","保安族","裕固族","京族","塔塔尔族","独龙族",
    "鄂伦春族","赫哲族","门巴族","珞巴族","基诺族","外籍人士"
];

function getAdminAreaName(districtId) {
    if (districtId == '0') {
        return districtName['0'];
    }
    if (districtId.length == 10) {
        return districtName['431127'][districtId.slice(0, 8)] +
            districtName[districtId.slice(0, 8)][districtId];
    }
    return '未定义';
}
/* GET home page. */
router.get('/', function(req, res) {
    debug("session: " + util.inspect(req.session));
    res.render('index', {
        title: '劳动力资源信息库',
        adminArea: getAdminAreaName(req.session.user.area)
    });
});

/* login page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'login' });
});

/* login page. */
router.post('/login', function(req, res) {
    //res.render('index', { title: 'login' });
    var acc = {
        username: req.body.username.trim(),
        password: req.body.password.trim()
    };
    debug('account: ' + JSON.stringify(acc));
    debug("session: " + util.inspect(req.session));
    db.getAccount(acc.username, function(error, account) {
        debug('account from DB: ' + JSON.stringify(account));
        debug('auth.auth(acc, account): ' + auth.auth(acc, account));
        if (auth.auth(acc, account)) {
            if (acc.username == auth.builtinUser) {
                acc.area = '0';
                acc.permisssion = '管理员';
                acc.type = 'independent'
            } else {
                acc.area = account.area;
                acc.permission = account.permission;
                acc.type = account.type;
            }
            req.session.user = acc;
            req.session.error = undefined;
            res.redirect('/');
        } else {
            res.render('login', {error: '用户名或密码错误！'})
        }
        //res.end('auth ok');
    });

});

/* independent account management page. */
router.get('/account', function(req, res) {
    db.queryAccounts(
        {type: 'independent'},
        function(err, accounts) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }
            debug('type of accounts: ' +
                Object.prototype.toString.call(accounts));
            // if no builtin user in accounts, add one.
            if (accounts.every(
                function(a) {return a.username != auth.builtinUser;})) {
                accounts.unshift({
                    username: auth.builtinUser,
                    typ: 'independent',
                    enabled: true,
                    area: '0',
                    permission: '管理员'
                });
            }

            for (var i = 0; i < accounts.length; i++) {
                debug('districtId: ' + accounts[i].area);
                // translate district ID to name
                var town = accounts[i].area.slice(0, 8);
                if (districtName['431127'].hasOwnProperty(town)) {
                    accounts[i].area = districtName['431127'][town] +
                        districtName[town][accounts[i].area];
                }
                if (accounts[i].permission == '管理员') {
                    accounts[i].area = '';
                }
            }
            res.render(
                'account',
                {
                    adminArea: getAdminAreaName(req.session.user.area),
                    title: 'administration',
                    accounts: accounts,
                    builtinUser: auth.builtinUser,
                    districtName: districtName
                });
        }
    );
});

/* independent account management page. */
router.post('/account', function(req, res) {
    if (req.body.password != req.body.retryPassword) {
        console.log('password not match');
        res.render(
            'editResponse',
            {
                title: 'account manager',
                postMessage: {err: 'password not match!'}
            }
        );
        return;
    }
    var enabled = (req.body.status == 'enable');
    var account = {
        username: req.body.username,
        enabled: enabled,
        password: req.body.password,
        area: req.body.area,
        permission: req.body.permission,
        // account type (independent/bind)
        type: 'independent'
    };
    if (account.permission == '管理员') {
        account.area = '0';
    }
    db.saveAccount(account);
    res.redirect('/account');
    /*
    res.render(
        'editResponse',
        {
            title: 'account manager',
            postMessage: account
        }
    );
    */
});

/* process account update */
router.get('/updateAccount', function(req, res) {
    var user = req.query.user;
    var op = req.query.op;
    if (user == req.session.user.username) {
        res.send('error');
        return;
    }
    if (user == auth.builtinUser) {
        db.getAccount(auth.builtinUser, function(err, acc) {
            if (!acc) {
                return;
            }
            if (op == 'disable' || op == 'enable') {
                db.changeAccountStatus(req.query.user, op == 'enable');
                res.send('ok');
            }
        });
    } else {
        if (op == 'disable' || op == 'enable') {
            db.changeAccountStatus(req.query.user, op == 'enable');
            res.send('ok');
        }
        if (op == 'remove') {
            db.deleteAccount(user);
            res.send('ok');
        }
    }

});

/* reset password page. */
router.get('/resetPassword', function(req, res) {
    res.render(
        'resetPassword',
        {
            title: '重置密码',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
});

/* change password page. */
router.post('/resetPassword', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var retryPassword = req.body.retryPassword;
    if (!password || password != retryPassword) {
        res.send('errPassword');
        return;
    }
    debug('session.user.name: ' + req.session.user.name);
    debug('username: ' + username);
    if (req.session.user.username != username &&
        req.session.user.permission != '管理员') {
        res.send('errPermission');
        return;
    }
    db.changeAccountPassword(username, password, function(err) {
        if (err) {
            res.send('errDbOperation');
        } else {
            res.send('ok');
        }
    });
});

/* batch account management page. */
router.get('/batchAccount', function(req, res) {
    res.render(
        'batchAccount',
        {
            title: 'batchAccount',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
});

/* batch account management page. */
router.post('/batchAccount', function(req, res) {
    if (req.session.user.permission != '管理员') {
        res.send('permission denied');
        res.send('err');
        return;
    }
    debug('command: ' + req.body.command);
    if (req.body.command == 'initAccount') {
        db.batchInitAccount(districtName, function(err) {
            if (err) {
                console.error('save error: \n%o', err);
                res.send('err');
                return;
            }
            res.send('ok');
        });
    } else if (req.body.command == 'initPassword') {
        db.batchInitPassword(req.body.password, function(err) {
            if (err) {
                console.error('save error: \n%o', err);
                res.send('err');
                return;
            }
            res.send('ok');
        });
    } else if (req.body.command == 'changePermission') {
        db.batchChangePermission(req.body.permission, function(err) {
            if (err) {
                console.error('save error: \n%o', err);
                res.send('err');
                return;
            }
            res.send('ok');
        });
    } else if (req.body.command == 'changeStatus') {
        db.batchChangeStatus(req.body.status, function(err) {
            if (err) {
                console.error('save error: \n%o', err);
                res.send('err');
                return;
            }
            res.send('ok');
        });
    } else {
        res.send('err');
    }
});


/* add/modify item page. */
router.get('/item', function(req, res) {
    res.render('item', {
        title: 'add/modify item',
        adminArea: getAdminAreaName(req.session.user.area),
        nations: nations
    });
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
    res.render('editResponse', {postMessage: userMessage});
});

/* prepare statistics table page, ask for search parameters. */
router.get('/tables/:title', function(req, res) {
    debug('tables: ' + util.inspect(table.tablesName));
    debug('title: ' + req.param('title'));
    res.render(
        'statistics',
        {
            tableName: req.param('title'),
            tables: table.cnTableName,
            adminArea: getAdminAreaName(req.session.user.area)
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
                data: data,
                adminArea: getAdminAreaName(req.session.user.area)
            }
        );
    });
});

/* export data page. */
router.get('/export', function(req, res) {
    res.render(
        'export',
        {
            title: 'export',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
});

/* export data page. */
router.post('/export', function(req, res) {
    res.render(
        'export',
        {
            title: 'export',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
});

/* search page. */
router.get('/search', function(req, res) {
    res.render(
        'search',
        {
            title: 'search',
            adminArea: getAdminAreaName(req.session.user.area),
            nations: nations,
            districtName: districtName
        }
    );
});

/* search page. */
router.post('/search', function(req, res) {
    res.render(
        'search',
        {
            title: 'search',
            adminArea: getAdminAreaName(req.session.user.area),
            nations: nations
        }
    );
});

/* help page. */
router.get('/help', function(req, res) {
    res.render(
        'help',
        {
            title: 'help',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
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
