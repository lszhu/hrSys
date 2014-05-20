var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.connect(
    'mongodb://localhost:27017/hrsys',
    {
        server: {socketOptions: {keepAlive: 1}},
        user: 'hrsys',
        pass: 'letmein'
        //auth: {authenticationDatabase: 'hrsys'}
    }
);
var db = mongoose.connection;

db.on('error', function(err) {
    console.error('connection error:', err);
});
db.once('open', function() {
    console.log('database connected.');
});

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

var Item = mongoose.model('hrmsg', itemSchema);

exports.save = function(hrMsg) {
    Item.update(
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
    Item.find(condition, callback);
};

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