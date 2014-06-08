var express = require('express');
var router = express.Router();
var util = require('util');
var iconv = require('iconv-lite');

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
// job type
var jobType = require('../config/jobType');
// worker employment/unemployment register id
var workRegisterId = require('../config/workRegisterId');
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
// province
var provinces = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
    '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省',
    '福建省', '江西省', '山东省', '河南省', '湖北省', '广东省', '广西壮族自治区',
    '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省',
    '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'];

function getAddress(districtId) {
    var address = {
        county: districtName['0'],
        town: '',
        village: ''
    };
    if (districtId.length == 10) {
        address.county = districtName['4311']['431127'];
        address.town = districtName['431127'][districtId.slice(0, 8)];
        address.village = districtName[districtId.slice(0, 8)][districtId];
    }
    return address;
}

function getAdminAreaName(districtId) {
    var address = getAddress(districtId);
    if (districtId == '0') {
        return address['county'];
    }
    return address['town'] + ' ' + address['village'];
    /*
    if (districtId == '0') {
        return districtName['0'];
    }
    if (districtId.length == 10) {
        return districtName['431127'][districtId.slice(0, 8)] + ' ' +
            districtName[districtId.slice(0, 8)][districtId];
    }
    return '未定义';
    */
}

function createFilename() {
    var t = new Date();
    var name = t.getFullYear() + '-';
    name += t.getMonth() + 1 + '-' + t.getDate() + '_';
    name += t.getHours() + '-' + t.getMinutes() + '-' + t.getSeconds();
    name += '.xls';
    return name;
}

/* GET home page. */
router.get('/', function(req, res) {
    debug("session: " + util.inspect(req.session));
    res.render('index', {
        title: '劳动力资源信息库',
        adminArea: getAdminAreaName(req.session.user.area),
        permission: req.session.user.permission
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
                acc.permission = '管理员';
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
    if (req.session.user.permission != '管理员') {
        console.error('permission denied');
        return res.send('permission denied');
    }
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
                    permission: req.session.user.permission,
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
    if (req.session.user.permission != '管理员') {
        console.error('permission denied');
        return res.send('permission denied');
    }
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
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
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
    if (req.session.user.permission != '管理员') {
        console.error('permission denied');
        return res.send('permission denied');
    }
    res.render(
        'batchAccount',
        {
            title: 'batchAccount',
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
        }
    );
});

/* batch account management page. */
router.post('/batchAccount', function(req, res) {
    if (req.session.user.permission != '管理员') {
        console.error('permission denied');
        res.send('permission denied');
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

/* query for workRegisterId */
router.get('/workRegisterId', function(req, res) {
    var regId = workRegisterId[req.param('idNumber')];
    if (!regId || !regId.trim()) {
        regId = 'noRegister';
    }
    res.send(regId);
});

/* add/modify item page. */
router.get('/item', function(req, res) {
    if (req.session.user.permission == '只读') {
        console.error('permission denied');
        return res.send('permission denied');
    }
    debug('req.session.user.area: ' + JSON.stringify(req.session.user.area));
    //debug('jobType' + JSON.stringify(jobType));
    res.render('item', {
        title: '添加人力资源信息',
        adminArea: getAdminAreaName(req.session.user.area),
        permission: req.session.user.permission,
        nations: nations,
        insurance: table.cnInsurance,
        province: provinces,
        jobType: jobType,
        builtinService: table.cnService,
        districtId: req.session.user.area,
        editor: req.session.user.username,
        address: districtName['4311']['431127'] + ' ' +
            getAdminAreaName(req.session.user.area)
    });
});

/* add/modify page. */
router.post('/item', function(req, res) {
    if (req.session.user.permission == '只读') {
        console.error('permission denied');
        return res.send('permission denied');
    }
    var insurance = [];
    for (var i = 0; i < table.cnInsurance.length; i++) {
        if (req.body['insurance' + i]) {
            insurance.push(i);
        }
    }
    var postService = [];
    for (i = 0; i < table.cnService.length; i++) {
        if (req.body['postService' + i]) {
            postService.push(i);
        }
    }
    var preferredService = [];
    for (i = 0; i < table.cnService.length; i++) {
        if (req.body['preferredService' + i]) {
            preferredService.push(i);
        }
    }

    var address;
    if (req.session.user.area.length != 10) {
        var addr = req.body.address.split(/\s+/);
        address = {
            county: addr[0],
            town: addr[1],
            village: addr[2]
        }
    } else {
        address = getAddress(req.session.user.area);
    }

    var workRegisterId = req.body.districtId;
    if (workRegisterId == '暂无') {
        workRegisterId = '';
    }

    var workProvince = req.body.workProvince;
    if (workProvince == undefined) {
        workProvince = '';
    }

    var userMessage = {
        // basic info
        username: req.body.username,
        idNumber: req.body.idNumber,
        nation: req.body.nation,
        // readonly basic info
        age: req.body.age,
        gender: req.body.gender,
        workRegisterId: workRegisterId,
        address: address,
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
            jobType: req.body.jobType,
            industry: req.body.industry,
            startWorkDate: req.body.startWorkDate,
            workplace: req.body.workplace,
            workProvince: workProvince,
            salary: req.body.salary,
            jobForm: req.body.jobForm
        },
        // unemployment info
        unemploymentInfo: {
            humanCategory: req.body.humanCategory,
            unemployedDate: req.body.unemployedDate,
            unemploymentCause: req.body.unemploymentCause,
            familyType: req.body.familyType,
            preferredJobType: [req.body.jobType01, req.body.jobType02],
            //extraPreferredJobType: req.body.extraPreferredJobType,
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

    db.preprocessUserMsg(userMessage);
    db.save(userMessage);
    res.render('postItem', {
        title: '添加人力资源信息',
        adminArea: getAdminAreaName(req.session.user.area),
        permission: req.session.user.permission
    });
    //res.redirect('/item');
});

/* update person info page. */
/*
router.get('/update', function(req, res) {
    res.render(
        'updatePerson',
        {
            title: '指定待修改人员',
            adminArea: getAdminAreaName(req.session.user.area)
        }
    );
});
*/
/* update person info page. */
/*
router.post('/update', function(req, res) {
    var area = req.session.user.area;
    var bound = req.body.condition;
    if (area != '0') {
        bound.address = getAddress(area);
    }
    debug('db.remove bound is: ' + JSON.stringify(bound));
    db.query(bound, function(err, data) {
        if (err) {
            res.send('dbError');
            return;
        }
        if (data) {
            res.render('item',
                {
                    title: '添加人力资源信息',
                    initMsg: data,
                    adminArea: getAdminAreaName(req.session.user.area),
                    nations: nations,
                    districtId: req.session.user.area,
                    editor: req.session.user.username,
                    address: districtName['4311']['431127'] + ' ' +
                        getAdminAreaName(req.session.user.area)
                }
            )
        }
        res.send('ok');
    });
});
*/

/* delete person info page. */
router.get('/delete', function(req, res) {
    if (req.session.user.permission == '只读') {
        console.error('permission denied');
        return res.send('permission denied');
    }
    res.render(
        'deletePerson',
        {
            title: '指定待删除人员',
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
        }
    );
});

/* delete person info page. */
router.post('/delete', function(req, res) {
    if (req.session.user.permission == '只读') {
        console.error('permission denied');
        return res.send('permission denied');
    }
    var area = req.session.user.area;
    var bound = req.body.condition;
    if (area != '0') {
        bound.address = getAddress(area);
    }
    debug('db.remove bound is: ' + JSON.stringify(bound));
    db.remove(bound, function(err) {
        if (err) {
            res.send('dbError');
            return;
        }
        res.send('ok');
    });
});

/* prepare statistics table page, ask for search parameters. */
router.get('/tables/:title', function(req, res) {
    debug('tables: ' + util.inspect(table.cnTableName));
    debug('title: ' + req.param('title'));
    res.render(
        'statistics',
        {
            tableName: req.param('title'),
            tables: table.cnTableName,
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
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
        // to show no more than 500 items in web page
        if (data.length > 500) {
            data.length = 500;
        }
        res.render(
            'tableEmployed',
            {
                title: table.cnTableName[tableName],
                data: data,
                adminArea: getAdminAreaName(req.session.user.area),
                permission: req.session.user.permission
            }
        );
    });
});

/* export data page. */
router.get('/export', function(req, res) {
    var area = req.session.user.area;
    var districtId = req.query.districtId;
    if (area == '0' && districtId == undefined) {
        return res.render(
            'export',
            {
                title: 'export',
                adminArea: getAdminAreaName(req.session.user.area),
                area: req.session.user.area,
                districtName: districtName,
                permission: req.session.user.permission
            }
        );
    }
    var bound = {};
    if (area != 0) {
        bound.districtId = area;
    } else if (districtId.length == 10) {
        bound.districtId = districtId;
    } else if (districtId.length == 8) {
        bound.districtId = new RegExp(districtId);
    }
    db.query(bound, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            return res.send('Database error');
        }
        //table.dataTranslate(data);
        debug('data translated: ' + data.length);
        // to show no more than 500 items in web page
        //res.send(table.createSearchTable(500, data));
        // download file and save as microsoft excel file (.xls)
        var filename = createFilename();
        res.setHeader('Content-disposition',
                'attachment; filename=' + filename);
        // download file and save as microsoft excel file (.xls)
        var mimetype = 'application/vnd.ms-excel';
        res.setHeader('Content-type', mimetype);
        res.send(iconv.encode(table.prepareDownload('search', data), 'gbk'));
    });
});

/* export data page. */
router.post('/export', function(req, res) {
    res.render(
        'export',
        {
            title: 'export',
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
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
            permission: req.session.user.permission,
            nations: nations,
            jobType: jobType,
            area: req.session.user.area,
            districtName: districtName
        }
    );
});

/* search page. */
router.post('/search', function(req, res) {
    var sel = ['gender', 'nation', "districtId", 'censusRegisterType',
        'education', 'employment', 'workplace', 'jobType'];
    var bound = {};
    var cond = req.body.condition;

    // check access rights
    var area = req.session.user.area;
    if (area != 0 && area.slice(0, 8) != cond.districtId.slice(0, 8)) {
        return res.send('permissionDeny');
    }

    if (cond.username) {
        bound.username = new RegExp(cond.username);
    }

    if (cond.ageMin || cond.ageMax) {
        bound.age = {
            $gte: cond.ageMin ? cond.ageMin : 0,
            $lte: cond.ageMax ? cond.ageMax : 100
        };
    }

    for (var i = 0; i < sel.length; i++) {
        if (cond[sel[i]] == '0' || cond[sel[i]] == '不限') {
            continue;
        }
        if (sel[i] == 'districtId') {
            bound.districtId = new RegExp(cond.districtId);
            debug('regexp: ' + bound.districtId);
            continue;
        }
        bound[sel[i]] = cond[sel[i]];
    }
    //bound.districtId = new RegExp(cond.districtId);
    debug('bound: ' + JSON.stringify(bound));
    db.query(bound, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            return res.send('Database error');
        }
        //table.dataTranslate(data);
        debug('data translated: ' + data.length);
        // to show no more than 500 items in web page
        res.send(table.createSearchTable(500, data));
    });
});

/* download search results to xls file */
router.get('/download', function(req, res) {
    var sel = ['gender', 'nation', "districtId", 'censusRegisterType',
        'education', 'employment', 'workplace', 'jobType'];
    var bound = {};
    var cond = req.query;
    debug('req.query: ' + JSON.stringify(cond));

    // check access rights
    var area = req.session.user.area;
    if (area != 0 && area.slice(0, 8) != cond.districtId.slice(0, 8)) {
        return res.send('permissionDeny');
    }

    if (cond.username) {
        bound.username = new RegExp(cond.username);
    }

    if (cond.ageMin || cond.ageMax) {
        bound.age = {
            $gte: cond.ageMin ? cond.ageMin : 0,
            $lte: cond.ageMax ? cond.ageMax : 100
        };
    }

    for (var i = 0; i < sel.length; i++) {
        if (cond[sel[i]] == '0' || cond[sel[i]] == '不限') {
            continue;
        }
        if (sel[i] == 'districtId') {
            bound.districtId = new RegExp(cond.districtId);
            debug('regexp: ' + bound.districtId);
            continue;
        }
        bound[sel[i]] = cond[sel[i]];
    }

    debug('bound: ' + JSON.stringify(bound));
    db.query(bound, function(err, data) {
        if (err) {
            console.error('error: ' + err);
            return res.send('Database error');
        }
        //table.dataTranslate(data);
        debug('data translated: ' + data.length);
        // to show no more than 500 items in web page
        //res.send(table.createSearchTable(500, data));
        // download file and save as microsoft excel file (.xls)
        var filename = createFilename();
        res.setHeader('Content-disposition',
                'attachment; filename=' + filename);
        // download file and save as microsoft excel file (.xls)
        var mimetype = 'application/vnd.ms-excel';
        res.setHeader('Content-type', mimetype);
        res.send(iconv.encode(table.prepareDownload('search', data), 'gbk'));
        //res.send(data);
    });

    /*
    var file = __dirname + '/../config/temp.xls';
    var filename = 'temp.xls';
    var mimetype = 'application/vnd.ms-excel';
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    //var filestream = fs.createReadStream(file);
    var fileContent = fs.readFileSync(file);
    res.send(fileContent);
    //filestream.pipe(res);
    */
});

/* help page. */
router.get('/help', function(req, res) {
    res.render(
        'help',
        {
            title: 'help',
            adminArea: getAdminAreaName(req.session.user.area),
            permission: req.session.user.permission
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