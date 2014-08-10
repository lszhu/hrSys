// get current county
var countyName = require('../config/config').county;
// static data path
var staticDataPath = __dirname + '/../config/staticData/' + countyName;
// 以工种编号索引工种名称，只导入local类型
var cnJobTypeName = require(staticDataPath + '/jobType').local;
// 用于导出xlsx文件
var xlsx = require('xlsx');
//var fs = require('fs');

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
    workRegisterId: '就业失业登记证号',
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
    preferredTraining: '培训意向需求',
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
    '新农保',              // 新型农村养老保险
    '城镇职工医疗保险',
    '城镇居民医疗保险',
    '失业保险',
    '工伤保险',
    '新农合'               // 新型农村合作医疗保险
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

// service type
var serviceType = [
    '职业介绍',
    '职业培训',
    '职业技能鉴定',
    '社会保险补贴',
    '公益性岗位安置',
    //'小额担保贷款贴息',
    '小额担保贷款',
    '就业见习'
];

// name map
var specialNameMap = {
    startupTraining: '创业培训',
    vocationalTraining: '职业培训',
    securedLoan: '小额担保贷款',
    skillVerification: '职业技能鉴定'
};

var tableColumns = {
    search: ['username', 'gender', 'age', 'nation', 'address', 'education',
        'censusRegisterType', 'employment', 'workplace', 'jobType'],
    download: ['username', 'gender', 'age', 'nation', 'address', 'education',
        'censusRegisterType', 'employment', 'workplace', 'jobType', 'phone'],
    farmerInCounty: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workplace', 'jobType', 'insurance', 'salary'],
    farmerOutCounty: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workplace', 'jobType', 'insurance', 'salary'],
    townsfolk: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'employer', 'workplace', 'jobType', 'insurance', 'salary'],
    graduate: ['username', 'gender', 'age', 'education', 'graduateDate',
        'workRegisterId', 'address', 'employment', 'phone'],
    annual: ['username', 'gender', 'age', 'education', 'marriage',
        'address', 'idNumber', 'jobType', 'phone'],
    summary: []
};

function address(a) {
    return a.county + a.town + a.village;
}

function getAge(birthday) {
    var birth = birthday.toString();
    var now = new Date();
    var age = now.getFullYear() - birth.slice(0, 4);
    if (now.getMonth() >= +birth.slice(4, 6)) {
        return age;
    } else if (now.getMonth() < birth.slice(4, 6) - 1) {
        age--;
    } else if (now.getDate() < birth.slice(6, 8)) {
        age--;
    }
    return age;
}

// 生成显示数据的html表格dom
function createSearchTable(n, data) {
    if (n < 0 || n > data.length) {
        n = data.length;
    }
    var html = '<table class="table table-condensed table-bordered table-' +
        'hover table-responsive"><thead><td>序号</td>';
    for (var j = 0; j < tableColumns.search.length; j++) {
        html += '<td>' + cnItemName[tableColumns.search[j]] + '</td>';
    }
    html += '</thead><tbody>';
    for (var i = 0; i < n; i++) {
        html += '<tr><td>' + (i + 1) + '</td>';
        for (j = 0; j < tableColumns.search.length - 2; j++) {
            if (tableColumns.search[j] == 'address') {
                html += '<td>' + address(data[i].address) + '</td>';
                continue;
            }
            if (tableColumns.search[j] == 'age') {
                html += '<td>' + getAge(data[i]['birthday']) + '</td>';
                continue;
            }
            html += '<td>' + data[i][tableColumns.search[j]] +'</td>';
        }
        // insert workplace info from preferredWorkplace
        if (data[i].employment == '已就业') {
            html += '<td>' + data[i].employmentInfo.workplace + '</td>';
            html += '<td>' + data[i].employmentInfo.jobType + '</td></tr>';
        } else {
            html += '<td>' + data[i].unemploymentInfo.preferredWorkplace +
                '</td>';
            html += '<td>' +
                data[i].unemploymentInfo.preferredJobType.join(', ') +
                '</td></tr>';
        }
    }
    html += '</tbody></table>';
    return html;
}

// 生成以tab为栏目分隔符的，换行符为记录分隔符的数据，用于导出到excel
// 返回内容适用于搜索页面的结果
function prepareSearchDownload(data) {
    var download = tableColumns['download'];
    var fileContent = '序号';
    var rowLength = download.length;
    for (var j = 0; j < rowLength; j++) {
        fileContent += '\t' + cnItemName[download[j]];
    }
    fileContent += '\r\n';
    rowLength -= 3;
    for (var i = 0, len = data.length; i < len; i++) {
        fileContent += i + 1 + '\t';
        for (j = 0; j < rowLength; j++) {
            if (download[j] == 'address') {
                fileContent += address(data[i].address) + '\t';
                continue;
            }
            if (download[j] == 'age') {
                fileContent += getAge(data[i]['birthday']) + '\t';
                continue;
            }
            fileContent += data[i][download[j]] + '\t';
        }
        // insert workplace info from preferredWorkplace
        if (data[i].employment == '已就业') {
            fileContent += data[i].employmentInfo.workplace + '\t';
            fileContent += data[i].employmentInfo.jobType + '\t';
        } else {
            fileContent += data[i].unemploymentInfo.preferredWorkplace + '\t';
            fileContent +=
                data[i].unemploymentInfo.preferredJobType.join(', ') + '\t';
        }
        // add telephone
        fileContent += data[i]['phone'] + '\r\n';
    }
    return fileContent;
}

// 由于内部直接保存保险对应编号，该定义仅用于参考，
var insuranceIndex = {
    '城镇职工养老保险': 0,
    '城镇居民养老保险': 1,
    '新农保': 2,
    '城镇职工医疗保险': 3,
    '城镇居民医疗保险': 4,
    '失业保险': 5,
    '工伤保险': 6,
    '新农合': 7
};

// 生成以tab为栏目分隔符的，换行符为记录分隔符的数据，用于导出到excel
// 返回内容基本包含数据库中相应人员的所有登记信息
function prepareExport(data) {
    var i, j, jobId, len;
    var basicInfo = [
        'districtId', 'county', 'town', 'village',
        'username', 'idNumber', 'workRegisterId', 'gender',
        'age', 'birthday', 'nation', 'politicalOutlook',
        'education', 'censusRegisterType', 'marriage', 'phone'
        ];
    var skillInfo = [
        'trained', 'trainingType', 'postTraining', 'certified',
        'technicalGrade', 'postService'
        ];
    var employed = [
        'employer', 'jobType', 'industry',
        'startWorkDate', 'workplace', 'workProvince',
        'salary', 'jobForm'
        ];
    var unemployed = [
        'humanCategory', 'unemployedDate', 'unemploymentCause','familyType',
        'preferredJobType', 'preferredIndustry', 'preferredSalary',
        'preferredWorkplace', 'preferredJobForm', 'preferredService',
        'preferredTraining'
    ];

    // 保存文件内容
    var fileContent = '序号';
    var basicInfoLength = basicInfo.length;
    var skillInfoLength = skillInfo.length;
    var employedLength = employed.length;
    var unemployedLength = unemployed.length;
    var insureLen = insurance.length;
    var insureStatus = [];

    for (j = 0; j < basicInfoLength; j++) {
        fileContent += '\t' + cnItemName[basicInfo[j]];
    }
    for (j = 0; j < skillInfoLength; j++) {
        fileContent += '\t' + cnItemName[skillInfo[j]];
    }
    for (j = 0; j < employedLength; j++) {
        fileContent += '\t' + cnItemName[employed[j]];
    }
    for (j = 0; j < unemployedLength; j++) {
        fileContent += '\t' + cnItemName[unemployed[j]];
    }
    for (j = 0; j < insureLen; j++) {
        fileContent += '\t' + insurance[j];
    }
    fileContent += '\r\n';
    for (i = 0, len = data.length; i < len; i++) {
        fileContent += i + 1;
        for (j = 0; j < basicInfoLength; j++) {
            if (basicInfo[j] == 'county' || basicInfo[j] == 'town' ||
                basicInfo[j] == 'village') {
                fileContent += '\t' + data[i]['address'][basicInfo[j]];
                continue;
            }
            if (basicInfo[j] == 'age') {
                fileContent += '\t' + getAge(data[i]['birthday']);
                continue;
            }
            // 过滤掉不正确的就业失业登记证号
            if (basicInfo[j] == 'workRegisterId' &&
                data[i][basicInfo[j]].length == 10) {
                fileContent += '\t';
                continue;
            }
            fileContent += '\t' + data[i][basicInfo[j]];
        }
        // 处理培训信息
        if (data[i]['trainingType'] == '无') {
            fileContent += '\t' + '否' + '\t\t';
        } else {
            fileContent += '\t' + '是' + '\t' + data[i]['trainingType'] +
                '\t' + data[i]['postTraining'];
        }
        // 处理职业资格等级证书信息
        if (data[i]['technicalGrade'] == '无') {
            fileContent += '\t' + '否' + '\t';
        } else {
            fileContent += '\t' + '是' + '\t' + data[i]['technicalGrade'];
        }
        // 处理已享受就业服务
        var service = data[i]['postService'].join(',');
        // 如果享受过额外就业服务，在此加入，且并入已享受就业服务
        if (data[i]['extraPostService']) {
            service += (service ? ',' : '') + data[i]['extraPostService']
        }
        fileContent += '\t' + service;
        // 处理以就业和暂未就业信息
        if (data[i].employment == '已就业') {
            for (j = 0; j < employedLength; j++) {
                // 将工种代码转换为文字名称
                if (employed[j] == 'jobType') {
                    jobId = data[i].employmentInfo[employed[j]];
                    fileContent += '\t' +
                        cnJobTypeName[jobId[0]][jobId];
                    continue;
                }
                // 对收入数据进行预处理
                if (employed[j] == 'salary') {
                    // 如果收入没有填写，输出为空白
                    if (!data[i].employmentInfo['salary']) {
                        fileContent += '\t';
                        continue;
                    // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
                    } else if (data[i].employmentInfo['salary'] > 100) {
                        fileContent += '\t' +
                            data[i].employmentInfo['salary'] / 10000;
                        continue;
                    }
                }
                fileContent += '\t' + data[i].employmentInfo[employed[j]];
            }
            for (j = 0; j < unemployedLength; j++) {
                fileContent += '\t';
            }
        } else {
            for (j = 0; j < employedLength; j++) {
                fileContent += '\t';
            }
            for (j = 0; j < unemployedLength; j++) {
                // 对收入期望数据进行预处理
                if (unemployed[j] == 'preferredSalary') {
                    // 如果收入期望没有填写，输出为空白
                    if (!data[i].unemploymentInfo['PreferredSalary']) {
                        fileContent += '\t';
                        continue;
                    // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
                    } else if (
                        data[i].unemploymentInfo['PreferredSalary'] > 100) {
                        fileContent += '\t' +
                            data[i].unemploymentInfo['PreferredSalary'] / 10000;
                        continue;
                    }
                }
                // 将工种代码转换为文字名称
                if (unemployed[j] == 'preferredJobType') {
                    jobId = data[i].unemploymentInfo[unemployed[j]][0];
                    fileContent += '\t' + cnJobTypeName[jobId[0]][jobId];
                    jobId = data[i].unemploymentInfo[unemployed[j]][1];
                    fileContent += ',' + cnJobTypeName[jobId[0]][jobId];
                    continue;
                }
                if (unemployed[j] == 'preferredService') {
                    fileContent += '\t' +
                        data[i].unemploymentInfo[unemployed[j]].join(',');
                    continue;
                }
                fileContent += '\t' + data[i].unemploymentInfo[unemployed[j]];
            }
        }
        // 处理参保信息
        // 初始化参保情况
        for (j = 0; j < insureLen; j++) {
            insureStatus[j] = '未参保';
        }
        for (j = 0; j < data[i].insurance.length; j++) {
            // 由保险名对应索引数字找到相应栏目
            insureStatus[data[i].insurance[j]] = '参保';
        }
        fileContent += '\t' + insureStatus.join('\t') + '\r\n';
    }
    return fileContent;
}

// 生成标准的excel数据（xlsx格式）用于导出
function createXlsx(data, callback) {
    // 导入xlsx的模板文件
    var workbook = xlsx.readFile(__dirname + '/../config/template.xlsx');
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    for (var i = 0, len = data.length; i < len; i++) {
        addXlsxRow(data[i], sheet, i + 2);
    }
    // 指定xlsx文件的表格范围，左上到右下。
    sheet['!ref'] = 'A1:AX' + (i + 2);
    // 返回nodejs方式的buf，内容包含xlsx文件的所有内容
    return xlsx.write(workbook, {type:'buffer'});

    /*// 创建一个临时的excel文件，以创建时的时间命名，使用后会自动被删除。
    var xlsxName = Date.now() + '.xlsx';
    xlsx.writeFile(workbook, __dirname + '/../temp/' + xlsxName);
    var content = fs.readFileSync(__dirname + '/../temp/' + xlsxName);
    callback(content);*/
}

// 将生成excel的批量密集运算分散到多个事件循环，以提升程序的响应能力
function asyncCreateXlsx(data, callback) {
    // 导入xlsx的模板文件
    var workbook = xlsx.readFile(__dirname + '/../config/template.xlsx');
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var batch = 1000;
    var length = data.length;
    function partialCreateXlsx(first) {
        var last =  first + batch;
        if (last >= length) {
            last = length;
        }
        for (var i = first; i < last; i++) {
            addXlsxRow(data[i], sheet, i + 2);
        }
        if (last == length) {
            // 指定xlsx文件的表格范围，左上到右下。
            sheet['!ref'] = 'A1:AX' + (last + 2);
            //console.log('time: ' + Date.now());
            callback(xlsx.write(workbook, {type: 'buffer'}));
        } else {
            setImmediate(partialCreateXlsx, last);
        }
    }
    partialCreateXlsx(0);
}

// 写入一行xlsx文件数据
function addXlsxRow(recorder, sheet, lineNo) {
    var i, tmp, info, len;

    // 以下处理个人基本信息
    sheet['A' + lineNo] = {v: lineNo - 1};
    sheet['B' + lineNo] = {v: recorder.districtId, t: 's'};
    sheet['C' + lineNo] = {v: recorder.address.county, t: 's'};
    sheet['D' + lineNo] = {v: recorder.address.town, t: 's'};
    sheet['E' + lineNo] = {v: recorder.address.village, t: 's'};
    // 如果姓名为空，则设为'某某'
    tmp = (recorder.username ? recorder.username: '某某');
    sheet['F' + lineNo] = {v: tmp, t: 's'};
    sheet['G' + lineNo] = {v: recorder.idNumber, t: 's'};
    sheet['H' + lineNo] = {v: recorder.workRegisterId, t: 's'};
    sheet['I' + lineNo] = {v: recorder.gender, t: 's'};
    sheet['J' + lineNo] = {v: getAge(recorder.birthday)};
    sheet['K' + lineNo] = {v: recorder.birthday, t: 's'};
    sheet['L' + lineNo] = {v: recorder.nation, t: 's'};
    sheet['M' + lineNo] = {v: recorder.politicalOutlook, t: 's'};
    sheet['N' + lineNo] = {v: recorder.education, t: 's'};
    sheet['O' + lineNo] = {v: recorder.censusRegisterType, t: 's'};
    sheet['P' + lineNo] = {v: recorder.marriage, t: 's'};
    sheet['Q' + lineNo] = {v: recorder.phone, t: 's'};
    // skillInfo
    if (recorder.trainingType == '无') {
        sheet['R' + lineNo] = {v: '否', t: 's'};
    } else {
        sheet['R' + lineNo] = {v: '是', t: 's'};
        sheet['S' + lineNo] = {v: recorder.trainingType, t: 's'};
        sheet['T' + lineNo] = {v: recorder.postTraining, t: 's'};
    }
    if (recorder.technicalGrade == '无') {
        sheet['U' + lineNo] = {v: '否', t: 's'};
    } else {
        sheet['U' + lineNo] = {v: '是', t: 's'};
        sheet['V' + lineNo] = {v: recorder.technicalGrade, t: 's'};
    }
    // 凡是由序号表示的服务类型，统一加1，即从1开始，内部保存为从0开始
    tmp = [];
    for (i = 0, len = recorder.postService.length; i < len; i++) {
        if (isNaN(recorder.postService[i])) {
            tmp.push(recorder.postService[i]);
        } else {
            tmp.push(+recorder.postService[i] + 1);
        }
    }
    if (tmp) {
        sheet['W' + lineNo] = {v: tmp.join(','), t: 's'};
    }

    // 以下处理就业信息
    if (recorder.employment == '已就业') {
         // employed
        info = recorder.employmentInfo;
        sheet['X' + lineNo] = {v: info.employer, t: 's'};
        tmp = info.jobType;
        sheet['Y' + lineNo] = {v: cnJobTypeName[tmp[0]][tmp], t: 's'};
        sheet['Z' + lineNo] = {v: info.industry, t: 's'};
        sheet['AA' + lineNo] = {v: info.startWorkDate, t: 's'};
        // change '外省' to '省外'
        tmp = (info.workplace == '外省' ? '省外' : info.workplace);
        sheet['AB' + lineNo] = {v: tmp, t: 's'};
        sheet['AC' + lineNo] = {v: info.workProvince, t: 's'};
        tmp = info.salary;
        // 如果收入没有填写，输出为空白
        if (tmp) {
            // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
            if (tmp > 100) {
                sheet['AD' + lineNo] = {v: tmp / 10000};
            } else {
                sheet['AD' + lineNo] = {v: tmp};
            }
        }
        // 如果'就业形式'为空，或为'其他'则设为'其它'
        tmp = (info.jobForm && info.jobForm != '其他' ? info.jobForm : '其它');
        sheet['AE' + lineNo] = {v: tmp, t: 's'};
    } else {
         // unemployed
        info = recorder.unemploymentInfo;
        // 如果'人员身份'为空，则设为'其他'
        tmp = (info.humanCategory ? info.humanCategory : '其他');
        sheet['AF' + lineNo] = {v: tmp, t: 's'};
        sheet['AG' + lineNo] = {v: info.unemployedDate, t: 's'};
        sheet['AH' + lineNo] = {v: info.unemploymentCause, t: 's'};
        sheet['AI' + lineNo] = {v: info.familyType, t: 's'};

        tmp = info.preferredJobType;//[0];
        var jobs = '';//cnJobTypeName[tmp[0]][tmp];
        if (tmp) {
            if (tmp[0]) {
                jobs += cnJobTypeName[tmp[0][0]][tmp[0]];
            }
            if (tmp[1] && tmp[0] != tmp[1]) {
                jobs += cnJobTypeName[tmp[1][0]][tmp[1]];
            }
        }
        //tmp = info.preferredJobType[1];
        //jobs += ',' + cnJobTypeName[tmp[0]][tmp];

        sheet['AJ' + lineNo] = {v: jobs, t: 's'};
        sheet['AK' + lineNo] = {v: info.preferredIndustry, t: 's'};
        tmp = info.preferredSalary;
        // 如果收入没有填写，输出为空白
        if (tmp) {
            // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
            if (tmp > 100) {
                sheet['AL' + lineNo] = {v: tmp / 10000};
            } else {
                sheet['AL' + lineNo] = {v: tmp};
            }
        }
        sheet['AM' + lineNo] = {v: info.preferredWorkplace, t: 's'};
        // 如果就业形式意向为'其他'，则改为'其它'
        tmp = (info.preferredJobForm == '其他' ? '其它': info.preferredJobForm);
        sheet['AN' + lineNo] = {v: tmp, t: 's'};
        // 凡是由序号表示的服务类型，统一加1，即从1开始，内部保存为从0开始
        tmp = [];
        for (i = 0, len = info.preferredService.length; i < len; i++) {
            if (isNaN(info.preferredService[i])) {
                tmp.push(info.preferredService[i]);
            } else {
                tmp.push(+info.preferredService[i] + 1);
            }
        }
        // 培训意向需求
        sheet['AO' + lineNo] = {v: tmp.join(','), t: 's'};
        tmp = info.preferredTraining;
        if (tmp && tmp == '职业培训') {
            sheet['AP' + lineNo] = {v: 1, t: 's'};
        } else if (tmp && tmp == '创业培训') {
            sheet['AP' + lineNo] = {v: 2, t: 's'};
        } else if (tmp && tmp == '企业高技能人才培训') {
            sheet['AP' + lineNo] = {v: 3, t: 's'};
        }
    }
    tmp = recorder.insurance;
    var cols = ['AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX'];
    for (i = 0; i < tmp.length; i++) {
        sheet[cols[tmp[i]] + lineNo] = {v: '参保', t: 's'};
    }
}

/*
// 生成标准的excel文件再准备下载
function createXls(data, callback) {
    // used to create xls file
    var xl = require('xlgen');

    var i, len;
    var exportColumn = [
        // basicInfo
        'sn', 'districtId', 'county', 'town', 'village',
        'username', 'idNumber', 'workRegisterId', 'gender',
        'age', 'birthday', 'nation', 'politicalOutlook',
        'education', 'censusRegisterType', 'marriage', 'phone',
        // skillInfo
        'trained', 'trainingType', 'postTraining', 'certified',
        'technicalGrade', 'postService',
        // employed
        'employer', 'jobType', 'industry',
        'startWorkDate', 'workplace', 'workProvince',
        'salary', 'jobForm',
        // unemployed
        'humanCategory', 'unemployedDate', 'unemploymentCause','familyType',
        'preferredJobType', 'preferredIndustry', 'preferredSalary',
        'preferredWorkplace', 'preferredJobForm', 'preferredService',
        'preferredTraining'
    ];
    // 创建一个临时的excel文件，以创建时的时间命名，使用后会自动被删除。
    var xlsName = Date.now() + '.xls';
    var xlg = xl.createXLGen(__dirname + '/../temp/' + xlsName);
    // 注册单元格的格式，此处仅特别指定字符串格式
    //var strFmt = xlg.addFormat(xl.formatStrings.string);
    // 创建sheet
    var sht = xlg.addSheet('个人台账');
    try {
        // 添加表头
        sht.cell(0, 0, '序号');
        for (i = 1, len = exportColumn.length; i <= len; i++) {
            sht.cell(0, i, cnItemName[exportColumn[i]]);
        }
        // 添加纪录行
        for (i = 0, len = data.length; i < len; i++) {
            addXlsLine(data[i], sht, i);
        }
    } catch (e) {
        console.log(e.name, e.message);
    }
    xlg.end(function(err) {
        if (err) {
            console.log(err.name, err.message);
        } else {
            var content = fs.readFileSync(__dirname + '/../temp/' + xlsName);
            callback(content);
        }
    });
}

// 注意这个函数和相应的依赖库有很多问题
function addXlsLine(recorder, sheet, index) {
    var c = sheet.cell;
    var r = recorder;
    var i = index + 1;
    var j, len, tmp;

    // 以下处理个人基本信息
    // basicInfo
    c(i, 0, i);
    c(i, 1, r.districtId);
    c(i, 2, r.address.county);
    c(i, 3, r.address.town);
    c(i, 4, r.address.village);
    c(i, 5, r.username);
    c(i, 6, r.idNumber);
    c(i, 7, r.workRegisterId);
    c(i, 8, r.gender);
    c(i, 9, getAge(r.birthday));
    c(i, 10, r.birthday);
    c(i, 11, r.nation);
    c(i, 12, r.politicalOutlook);
    c(i, 13, r.education);
    c(i, 14, r.censusRegisterType);
    c(i, 15, r.marriage);
    c(i, 16, r.phone);

     // skillInfo
    if (r.trainingType == '无') {
        c(i, 17, '否');
    } else {
        c(i, 17, '是');
        c(i, 18, r.trainingType);
        c(i, 19, r.postTraining);
    }
    if (r.technicalGrade == '无') {
        c(i, 20, '否');
    } else {
        c(i, 20, '是');
        c(i, 21, r.technicalGrade);
    }
    // 凡是由序号表示的服务类型，统一加1，即从1开始，内部保存为从0开始
    tmp = [];
    for (j = 0, len = r.postService.length; j < len; j++) {
        if (isNaN(r.postService[j])) {
            tmp.push(r.postService[j]);
        } else {
            tmp.push(+r.postService[j] + 1);
        }
    }
    //console.log(i + ' postService: ' + JSON.stringify(r.postService));
    //console.log('length: ' + len);
    tmp = tmp.join(',');
    console.log(i + ' tmp ' + tmp);
    tmp ? c(i, 22, tmp) : '';

    // 以下处理就业信息
    if (r.employment == '已就业') {
        // employed
        c(i, 23, r.employmentInfo.employer);
        tmp = r.employmentInfo.jobType;
        c(i, 24, cnJobTypeName[tmp[0]][tmp]);
        c(i, 25, r.employmentInfo.industry);
        c(i, 26, r.employmentInfo.startWorkDate);
        c(i, 27, r.employmentInfo.workplace);
        c(i, 28, r.employmentInfo.workProvince);
        tmp = r.employmentInfo.salary;
        // 如果收入没有填写，输出为空白
        if (tmp) {
            // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
            tmp > 100 ? c(i, 29, tmp / 10000) : c(i, 29, tmp);
        }
        c(i, 30, r.jobForm);
    } else {
        // unemployed
        c(i, 31, r.unemploymentInfo.humanCategory);
        c(i, 32, r.unemploymentInfo.unemployedDate);
        c(i, 33, r.unemploymentInfo.unemploymentCause);
        c(i, 34, r.unemploymentInfo.familyType);
        tmp = r.unemploymentInfo.preferredJobType[0];
        var jobs = cnJobTypeName[tmp[0]][tmp];
        tmp = r.unemploymentInfo.preferredJobType[1];
        jobs += ',' + cnJobTypeName[tmp[0]][tmp];
        c(i, 35, jobs);
        c(i, 36, r.unemploymentInfo.preferredIndustry);
        tmp = r.unemploymentInfo.preferredSalary;
        // 如果收入没有填写，输出为空白
        if (tmp) {
            // 如果收入大于100，则认为单位是元，故除以10000以转化为万元
            tmp > 100 ? c(i, 37, tmp / 10000) : c(i, 37, tmp);
        }
        c(i, 38, r.unemploymentInfo.preferredWorkplace);
        c(i, 39, r.unemploymentInfo.preferredJobForm);
        c(i, 40, r.unemploymentInfo.preferredService);
        c(i, 41, r.unemploymentInfo.preferredTraining);
    }
}
*/

// 根据不同的type参数选择合适的处理方式，对数据data进行预处理
function prepareDownload(type, data) {
    if (type == 'search') {
        return prepareSearchDownload(data);
    }
    if (type == 'export') {
        return prepareExport(data);
    }
}

// 批量的处理，将一些实用符合或数字表示的栏目转换为文字
function dataTranslate(data) {
    var len = data.length;
    for (var i = 0; i < len; i++) {
        msgTranslate(data[i]);
    }
}

// 将一些使用符合或数字表示的栏目转换为文字
function msgTranslate(personalMsg) {
    var item, temp;
    if (personalMsg.employment == '已就业') {
        item = personalMsg.employmentInfo.jobType;
        personalMsg.employmentInfo.jobType = cnJobTypeName[item[0]][item];

    } else {
        item = personalMsg.unemploymentInfo.preferredJobType;
        temp = [];
        for (var i = 0; i < item.length; i++) {
            temp.push(cnJobTypeName[item[i][0]][item[i]]);
        }
        personalMsg.unemploymentInfo.preferredJobType = temp;
    }
}

module.exports = {
    tableColumns: tableColumns,
    cnTableName: cnTableName,
    cnItemName: cnItemName,
//    cnEducation: education,
//    cnTechnicalGrade: technicalGrade,
//    cnPreferredTraining: preferredTraining,
//    cnWorkExperience: workExperience,
//    cnworkplace: workplace,
    cnService: serviceType,
    cnInsurance: insurance,
    createSearchTable: createSearchTable,
    prepareDownload: prepareDownload,
    dataTranslate: dataTranslate,
    createXlsx: createXlsx,
    asyncCreateXlsx: asyncCreateXlsx
//    createXls: createXls
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
        'workplace': workplace,
        'jobType': jobType,
        'industry': industry
    };
    for (var i in recorders) {
        if (recorders.hasOwnProperty(i)) {
            item[i] = translate(item[i], recorders[i]);
        }
    }
}
