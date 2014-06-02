// monggodb server parameters
var db = require('../config/config').db;

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://' + db.server.address + ':' +
    db.server.port + '/' + db.server.dbName, db.parameter);
/*
mongoose.connect(
    'mongodb://localhost:27017/hrsys',
    {
        server: {socketOptions: {keepAlive: 1}},
        user: 'hrsys',
        pass: 'letmein'
        //auth: {authenticationDatabase: 'hrsys'}
    }
*/

var dbConnection = mongoose.connection;

dbConnection.on('error', function(err) {
    console.error('connection error:', err);
});
dbConnection.once('open', function() {
    console.log('database connected.');
});

var personSchema = new Schema({
    // basic info
    username: String,
    idNumber: String,
    nation: String,
    // readonly basic info
    age: Number,
    gender: String,
    workRegisterId: String,
    address: {
        county: String,
        town: String,
        village: String
    },
    districtId: Number,
    // still basic info
    education: String,
    graduateDate: Number,
    phone: String,
    censusRegisterType: String,
    politicalOutlook: String,
    marriage: String,
    // training and service info
    trainingType: String,
    postTraining: String,
    technicalGrade: String,
    postService: [String],
    extraPostService: String,
    // employment/unemployment switch
    employment: String,
    // employment info
    employmentInfo: {
        employer: String,
        jobType: [String],
        industry: String,
        startWorkDate: String,
        workplace: String,
        workProvince: String,
        salary: Number,
        jobForm: String
    },
    // unemployment info
    unemploymentInfo: {
        humanCategory: String,
        unemployedDate: String,
        unemploymentCause: String,
        familyType: String,
        preferredJobType: [String],
        extraPreferredJobType: String,
        preferredSalary: Number,
        preferredIndustry: String,
        preferredWorkplace: String,
        preferredJobForm: String,
        preferredService: [String],
        extraPreferredService: String,
        preferredTraining: String
    },
    // insurance info
    insurance: [String],
    // editor info
    editor: String,
    modifiedDate: Date
});

var PersonMsg = mongoose.model('hrmsg', personSchema);
exports.save = function(hrMsg) {
    PersonMsg.update(
        {idNumber: hrMsg.idNumber},
        hrMsg,
        {upsert: true},
        function(err) {
            if (err) {
                console.error('save error: \n%o', err);
            }
        });
};

exports.query = function(condition, callback) {
    PersonMsg.find(condition)
        .lean()         // make return value changeable
        .sort('username')
        .exec(callback);
};

exports.getAddress = getAddress;
function getAddress(editor) {
    console.log('editor: ' + editor);
    return {
        county: '蓝山县',
        town: '塔峰镇',
        village: '塔峰西路'
    };
}

exports.preprocessUserMsg = function(userMsg) {
    userMsg.address = getAddress(userMsg.administrator);
    if (userMsg.employment == '已就业') {
        userMsg.unemploymentInfo = null;
    } else {
        userMsg.employmentInfo = null;
    }
};

var accountSchema = new Schema({
    username: String,
    password: String,
    enabled: Boolean,
    area: String,
    permission: String,
    // type can be 'independent' or 'bound'
    type: String
});

var Account = mongoose.model('account', accountSchema);

// save account information
exports.saveAccount = function(acc) {
    Account.update(
        {username: acc.username},
        acc,
        {upsert: true},
        function(err) {
            if (err) {
                console.error('save error: \n%o', err);
            }
        });
};

// change account status
exports.changeAccountStatus = function(user, status) {
    Account.update({username: user}, {enabled: status}, function(err) {
        if (err) {
            console.error('save error: \n%o', err);
        }
    });
};

// change account password
exports.changeAccountPassword = function(user, password, callback) {
    Account.update({username: user}, {password: password}, callback);
};

// delete account
exports.deleteAccount = function(user) {
    Account.remove({username: user}, function(err) {
        if (err) {
            console.error('save error: \n%o', err);
        }
    });
};

// query accounts information
exports.queryAccounts = function(condition, callback) {
    Account.find(condition)
        .lean()         // make return value changeable
        .sort('username')
        .exec(callback);
};

// get account information
exports.getAccount = function(username, callback) {
    Account.findOne({username: username}, callback);
};

// batch initiate bound account with district ID
exports.batchInitAccount = function(districts, callback) {
    for (var town in districts['431127']) {
        if (!districts['431127'].hasOwnProperty(town)) {
            continue;
        }
        for (var village in districts[town]) {
            if (!districts[town].hasOwnProperty(village)) {
                continue;
            }
            var account = {
                username: village,
                password: Date.now(),
                enabled: false,
                area: village,
                permission: '只读',
                type: 'bound'
            };
            Account.update(
                {username: acc.username},
                account,
                {upsert: true},
                callback
            );
        }
    }
};

// batch initiate bound account with district ID
exports.batchInitPassword = function(password, callback) {
    Account.update({type: 'bound'}, {password: password}, callback);
};

// batch initiate bound account with district ID
exports.batchInitPermission = function(permission, callback) {
    Account.update({type: 'bound'}, {permission: permission}, callback);
};

// batch initiate bound account with district ID
exports.batchInitStatus = function(status, callback) {
    Account.update({type: 'bound'}, {status: status}, callback);
};

////////////////////////////////////////////////////////

/*
// old data schema
var itemSchema = new Schema({
    username: String,
    idNumber: String,
    nation: String,
    marriage: Boolean,
    education: Number,
    phone: String,
    address: String,
    insurance: [Number],
    employment: Number,
    workTrend: Boolean,
    jobPreference: Number,
    workPlace: [Number],
    jobType: [Number],
    industry: [Number],
    project: Number,
    salary: Number,
    workExperience: Number,
    technicalGrade: Number,
    trainingStatus: Number,
    postTraining: String,
    preferredTraining: [Number],
    editor: String,
    auditor: String,
    modifiedDate: Date
});

//var Item = mongoose.model('hrmsg', itemSchema);
// used to create test data

var newItem = new Item({
    username: 'test',
    idNumber: '987655442398765544',
    nation: '维吾尔族',
    marriage: true,
    education: 3,
    phone: '13912345678',
    address: '中国湖南长沙岳麓山',
    insurance: [0, 1, 3, 4],
    employment: 2,
    workTrend: true,
    jobPreference: 2,
    workPlace: [0, 1, 2, 5],
    auditor: '张三',
    modifiedDate: new Date()
});
*/