var cnName = {
    farmerInCounty: '农村劳动力转移就业人员（县内）',
    farmerOutCounty: '农村劳动力转移就业人员（县外）',
    townsfolk: '城镇劳动力（居民）就业人员',
    graduate: '大、中专毕业生就业',
    annual: '劳动力资源登记台帐',
    summary: '劳动力资源统计汇总表'
};

var cnItemName = {
    username: '姓名',
    idNumber: '身份证号',
    age: '年龄',
    gender: '性别',
    nation: '名族',
    marriage: '婚姻状况',
    address: '户籍地址',
    phone: '联系电话',
    education: '文化程度',
    employment: '就业情况',
    workTrend: '是否打算外出就业',
    jobPreference: '外出就业意向',
    project: '打算返乡',
    salary: '外出务工月收入',
    workExperience: '外出务工时间',
    technicalGrade: '现有技术等级',
    trainingStatus: '是否参加过培训',
    postTraining: '参加过的培训',
    editor: '填报人',
    auditor: '审核人',
    insurance: '参保情况',
    industry: '从事行业',
    jobType: '从事工种',
    workPlace: '就业地点',
    preferredTraining: '参加农村劳动力技能培训意向',
    modifiedDate: '填报日期'
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
var preferredTraining = [
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


var columns = {
    farmerInCounty: ['username', 'gender', 'age', 'education',
        'marriage', 'address', 'workPlace', 'jobType', 'insurance', 'salary'],
    farmerOutCounty: ['username', 'gender', 'age', 'education',
        'marriage', 'address', 'workPlace', 'jobType', 'insurance', 'salary'],
    townsfolk: ['username', 'gender', 'age', 'education',
        'marriage', 'address', 'workPlace', 'jobType', 'insurance', 'salary'],
    graduate: ['username', 'gender', 'age', 'education',
        'address', 'employment', 'phone'],
    annual: ['username', 'gender', 'age', 'education',
        'marriage', 'address', 'idNumber', 'jobType', 'salary'],
    summary: []
};


module.exports = {
    columns: columns,
    cnName: cnName,
    cnItemName: cnItemName,
    cnEducation: education,
    cnInsurance: insurance,
    cnTechnicalGrade: technicalGrade,
    cnPreferredTraining: preferredTraining,
    cnSalary: salary,
    cnWorkExperience: workExperience,
    cnWorkPlace: workPlace,
    cnJobType: jobType,
    cnIndustry: industry
};