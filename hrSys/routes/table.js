var cnTableName = {
    farmerInCounty: '农村劳动力转移就业人员（县内）',
    farmerOutCounty: '农村劳动力转移就业人员（县外）',
    townsfolk: '城镇劳动力（居民）就业人员',
    graduate: '大、中专毕业生就业',
    annual: '劳动力资源登记台帐',
    summary: '劳动力资源统计汇总表'
};

var cnItemName = {
    // 个人基本信息
    districtId: '行政区划代码',
    address: '地址',                     // 由county/town/village合并而得
    county: '县（市）',
    town: '街道（乡镇）',
    village: '社区（村）',
    username: '姓名',
    idNumber: '身份证号码',
    workRegisterId:'就业失业登记证号',
    gender: '性别',
    age: '年龄',
    birthday: '出生日期',
    nation: '民族',
    politicalOutlook: '政治面貌',
    education: '学历',
    censusRegisterType: '户口性质',
    marriage: '婚姻状况',
    phone: '联系电话',
    // 个人就业信息
    trained: '是否参加技能培训',           // 是/否，由trainingType值是否为“无”而定
    trainingType: '培训类型',
    postTraining: '培训项目',             // trained为否时，本栏目为空
    certified: '是否获得国家职业资格证书',  // 是/否
    technicalGrade: '职业资格等级',
    postService: '已享受就业服务',         // 从extraPostService获得其他服务
    // 就业状态
    employment: '个人就业信息',            // true/false
    // 已转移就业信息
    employer: '就业单位',
    jobType: '主要从事工种',
    industry: '从事产业类型',
    startWorkDate: '就业时间',             // 格式为yyyymmdd
    workplace: '就业地点',
    workProvince: '外出省份',              // 如果workplace为“省外”则填入本栏
    salary: '年收入（万元）',
    jobForm: '就业形式',
    // 暂未转移就业信息
    humanCategory: '人员身份',
    unemployedDate: '失业时间',
    unemploymentCause: '失业原因',
    familyType: '困难群体情况',
    preferredJobType: '就业工种意向',     // 从extraPreferredJobType获得未列出工种
    preferredIndustry: '就业产业意向',
    preferredSalary: '工资收入意向',
    preferredWorkplace: '就业区域意向',
    preferredJobForm: '就业形式意向',
    preferredService: '就业服务需求',     // 从extraPreferredService获得未列出服务
    preferredTraining: '培训需求类型',
    // 多选参保信息
    insurance: '参保情况',
    // 其他制表信息
    editor: '填报人',
    modifiedDate: '填报日期'
};


//参保情况
var insurance = [
    '城镇职工养老保险',
    '城镇居民养老保险',
    '新型农村养老保险',         // 新农保
    '城镇职工医疗保险',
    '城镇居民医疗保险',
    '失业保险',
    '工伤保险',
    '新型农村合作医疗保险'      // 新农合
];

//现有技术等级
/*
var technicalGrade = [
    '无',
    '初级技工',
    '中级技工',
    '高级技工',
    '技师',
    '高级技师'
];
*/

//从事行业（多选）
/*
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
*/

// service type
var serviceType = [
    '职业介绍',
    '职业培训',
    '职业技能鉴定',
    '社会保险补贴',
    '公益性岗位安置',
    '小额担保贷款贴息',
    '小额担保贷款',
    '就业见习'
];

var TableColumns = {
    farmerInCounty: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workPlace', 'jobType', 'insurance', 'salary'],
    farmerOutCounty: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workPlace', 'jobType', 'insurance', 'salary'],
    townsfolk: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workPlace', 'jobType', 'insurance', 'salary'],
    graduate: ['username', 'gender', 'age', 'education', 'graduateDate',
        'workRegisterId', 'address', 'employment', 'phone'],
    annual: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'idNumber', 'jobType', 'phone'],
    summary: []
};


module.exports = {
    tableColumns: TableColumns,
    cnTableName: cnTableName,
    cnItemName: cnItemName,
//    cnEducation: education,
//    cnTechnicalGrade: technicalGrade,
//    cnPreferredTraining: preferredTraining,
//    cnWorkExperience: workExperience,
//    cnWorkPlace: workPlace,
    cnService: serviceType,
    cnInsurance: insurance
};

///////////////////////////////////////////////////
module.exports.prepareForTable = function(msg) {
    var a = msg.address;
    msg.address = a.county + a.town + a.village;
    if (msg.employment == '1') {
        msg.employer = msg.employmentInfo.employer;
        msg.workplace = msg.employmentInfo.workplace;
        msg.jobType = msg.employmentInfo.jobType;
        // employmentInfo.salary保存的收入是以万元为单位，此处转为月收入
        msg.salary = Math.floor(msg.employmentInfo.salary * 100 / 12) * 100;
    }
};

function translate(field, cnNameList) {
    if (typeof field != 'object') {
        return cnNameList[field];
    }
    var list = [];
    for (var i = 0; i < field.length; i++) {
        list.push(cnNameList[field[i]]);
    }
    return list;
}

function itemTranslate(item) {
    if (item.marriage) {
        item['marriage'] = '已婚';
    } else {
        item.marriage = '未婚';
    }
    //console.log('marriage: ' + item.marriage);
    var recorders = {
        'education': education,
        'insurance': insurance,
        'technicalGrade': technicalGrade,
        'preferredTraining': preferredTraining,
        'salary': salary,
        'workExperience': workExperience,
        'workPlace': workPlace,
        'jobType': jobType,
        'industry': industry
    };
    for (var i in recorders) {
        if (recorders.hasOwnProperty(i)) {
            item[i] = translate(item[i], recorders[i]);
        }
    }
}

module.exports.dataTranslate = function(data) {
    var len = data.length;
    for (var i = 0; i < len; i++) {
        itemTranslate(data[i]);
    }
};