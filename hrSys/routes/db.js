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

exports.search = function(condition) {
    return Item.find(condition).exec();
};

exports.count = {
    insurance: 7,
    workPlace: 7,
    jobType: 22,
    industry: 14,
    preferredTraining: 15
};

//文化程度
var education = [
    '初中及以下',
    '高中',
    '职业高中',
    '技工学校',
    '中专',
    '大专',
    '大学以上'
];

//参保情况
var insurance = [
    '城乡居民养老保险',
    '新型农村合作医疗保险',
    '企业职工基本养老保险',
    '企业职工基本医疗保险',
    '失业保险',
    '工伤保险',
    '生育保险'
];

//现有技术等级
var technicalGrade = [
    '无',
    '初级技工',
    '中级技工',
    '高级技工',
    '技师',
    '高级技师'
];

//参加农村劳动力技能培训意向
var perferredTraining = [
    '服装缝纫',
    '制鞋',
    '电子技术',
    '电脑',
    '家电维修',
    '电工',
    '焊工',
    '数控车床',
    '家政服务',
    '保安',
    '烹饪',
    '服务员',
    '美容美发',
    '商业营销',
    '其他'
];

//外出务工月收入
var salary = [
    '1500元以下',
    '1500-2000元',
    '2000-3000元',
    '3000元以上',
    '不详'
];

//外出务工时间
var workExperience = [
    '半年以下',
    '半年以上',
    '一年以上',
    '二年以上',
    '三年以上',
    '五年以上',
    '十年以上'
];

//就业地点
var workPlace = [
    '县内',
    '县外市内',
    '市外',
    '长三角',
    '珠三角',
    '其他',
    '境外'
];

//从事工种
var jobType = [
    '家电维修',
    '缝纫工',
    '木工',
    '油漆工',
    '车工',
    '钳工',
    '电工',
    '焊工',
    '钢筋工',
    '砌筑工',
    '铸造工',
    '家政服务',
    '营业员',
    '保安',
    '汽车维修',
    '管理人员',
    '烹饪',
    '制鞋',
    '电脑',
    '通信工程',
    '美容美发',
    '商业营销'
];

//从事行业（多选）
var industry = [
    '采矿业',
    '制造业',
    '建筑业',
    '金融业',
    '房地产业',
    '农林牧渔业',
    '交通运输业',
    '居民服务业',
    '计算机和软件服务业',
    '租赁和商业服务业',
    '批发零售业',
    '住宿餐饮业',
    '电力燃气及水的生产供应业',
    '仓储和邮政业'
];

exports.mapTable = {
    education: education,
    insurance: insurance,
    technicalGrade: technicalGrade,
    perferredTraining: perferredTraining,
    salary: salary,
    workExperience: workExperience,
    workPlace: workPlace,
    jobType: jobType,
    industry: industry

};