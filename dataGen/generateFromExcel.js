// 指定生成数据的原始数据目录
var rootPath = '../hrSys/';
var staticData = require(rootPath + 'config/dataParse');
var district = staticData.districtName;

var db = require(rootPath + 'routes/db');
// 导入xlsx文件分析库
var xlsx = require(rootPath + 'node_modules/xlsx');

var fs = require('fs');
var path = require('path');

/////////////////////////////////////////////////

// 主程序，调用批量导入函数，文件所在目录（相对当前文件所在位置）
batchImportFile('excel/part4');

//////////////////////////////////////////////////

// 批量导入excel文件内容到数据库，传入指定文件目录
function batchImportFile(dir) {
    var files = fs.readdirSync(dir);
    //console.log(files);
    files = files.filter(function(e) {return e && e.slice(-5) == '.xlsx'});
    for (var i = 0; i < files.length; i++) {
        setTimeout(function(index) {
            return function() {
                importFile(path.join(dir, files[index]));
            };
        }(i), i * 5000);
        //importFile(path.join(dir, files[i]));
    }
}

// 导入excel文件内容到数据库
function importFile(filename) {
    var data = parseExcel(filename);
    if (!data) {
        return;
    }
    var len = data.length;
    var sum = len;
    //console.log(data[0]);
    var item;
    for (var i = 0; i < len; i++) {
        item = formatData(data[i]);
        if (item) {
            db.save(item);
        } else {
            //console.log('出现非法数据：', data[i]);
            sum--;
        }

    }
    console.log('从文件%s导入%d条信息。', filename, sum);
}
// 测试
//importFile('excel/part1/1601-2500.xlsx');

///////////////////////////////////////////////////
// 工具函数

// 从地址信息分析得到并返回行政区划代码，无法得到结果则返回空值
function parseDistrictIdFromName(address) {
    var town = address.town;
    town = town ? town.trim() : '';
    var village = address.village;
    village = village ? village.trim() : '';
    if (!town && !village) {
        return '';
    }
    var county = getCountyId();
    var villages;
    var towns = district[county];
    if (town) {     // 至少提供了乡镇名称的情况
        for (var t in towns) {
            if (!towns.hasOwnProperty(t)) {
                continue;
            }
            // 找到乡镇
            if (towns[t].search(town) != -1) {
                // 如果没有提供村/社区名，则返回01编号的村/社区
                if (!village) {
                    return t + '01';
                }
                villages = district[t];
                // 继续找村/社区
                for (var v in villages) {
                    if (!villages.hasOwnProperty(v)) {
                        continue;
                    }
                    // 找到村/社区
                    if (villages[v].search(village) != -1) {
                        return v;
                    }
                }
                // 没找到村/社区，则返回01编号的村/社区
                return t + '01';
            }
        }
    } else if (village) {   // 只提供村/社区名的情况
        // 在整个区县范围内匹配村/社区名称
        for (var i in towns) {
            if (!towns.hasOwnProperty(i)) {
                continue;
            }
            villages = towns[i];
            for (var j in villages) {
                if (!villages.hasOwnProperty(j)) {
                    continue;
                }
                // 找到匹配的村/社区名称
                if (villages[j].search(village) != -1) {
                    return j;
                }
            }
        }
    }
    return '';
}

// get county Id from imported district Id
function getCountyId() {
    var city = district['4311'];
    for (var county in city) {
        if (city.hasOwnProperty(county)) {
            return county;
        }
    }
    // can not find exact county Id, return 0 indicate no bound
    return '0';
}

// 验证身份证号的合法性
function validIdNumber(idNum) {
    var idNumber = idNum;
    if (!idNumber) {
        return false;
    }
    idNumber = idNumber.trim();
    if (idNumber.length != 18 || 12 < idNumber.slice(10, 12) ||
        idNumber.slice(6, 8) < 19 || 20 < idNumber.slice(6, 8)) {
        return false;
    }
    var weights = [
        '7', '9', '10', '5', '8', '4', '2', '1', '6',
        '3', '7', '9', '10', '5', '8', '4', '2', '1'
    ];
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        var digit = idNumber.charAt(i);
        if (isNaN(Number(digit))) {
            return false;
        }
        sum += digit * weights[i];
    }
    sum = (12 - sum % 11) % 11;
    return sum == 10 && idNumber.charAt(17).toLowerCase() == 'x' ||
        sum < 10 && sum == idNumber.charAt(17);
}

// 由出生日期得到年龄
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

// 由身份证号得到性别
function getGender(idNumber) {
    if (!validIdNumber(idNumber)) {
        return '';
    }
    return idNumber.charAt(16) % 2 ? '男' : '女';
}

// 返回日期，格式：年-月-日
function getDate() {
    var t = new Date();
    var y = t.getFullYear();
    var m = t.getMonth() + 1;
    var d = t.getDate();
    return y + '年 ' + m + '月 ' + d + '日';
}

// 检查年份的合法性
function validYear(year) {
    if (!year) {
        return true;
    }
    return !isNaN(year) && 1900 < year && year < 2100;
}

// 检查电话的合法性
function validPhone(phone) {
    return !phone || phone.toString().trim().length > 5;
    //return !phone ||
    //    !isNaN(phone) && 6 < phone.length && phone.length < 13;
}

// 检查年月日的合法性，格式为：YYYYMMDD
function validDate(d) {
    if (!d) {
        return true;
    }
    if (d.slice(4, 6) == 2 && d.slice(6) > 28) {
        return false;
    }
    return d.length == 8 && !isNaN(d) && 19000000 < d &&
        d.slice(0, 4) < 2100 && d.slice(4, 6) < 13 && d.slice(6) < 32;
}
// 校验并生成日期字符串
function parseDate(str) {
    if (!str) {
        return '';
    }
    // 清除空格
    var s = str.toString().replace(/\s/g, '');
    if (!s || s.length < 4) {
        return '';
    }
    // YYYY.MM.DD
    s = s.split('.').slice(0, 3);
    s = s.join('');
    // YYYY-MM-DD
    s = s.split('-').slice(0, 3);
    s = s.join('');
    // 补足至少8个数字
    s += '1101';
    s = s.slice(0, 8);
    // YYYYMMDD
    if (!isNaN(s) && validDate(s)) {
        return s;
    }
    return '';
}
// 测试语句
//console.log(parseDate('1932.12-22'));

// 设置就业/失业时间，传入参数为个人信息条目
function setDate(o) {
    var d;
    if (o && o.employmentInfo) {
        d = o.employmentInfo.startWorkDate;
        o.employmentInfo.startWorkDate = parseDate(d);
    }
    if (o && o.unemploymentInfo) {
        d = o.unemploymentInfo.unemployedDate;
        o.unemploymentInfo.unemployedDate = parseDate(d);
    }
}

// 检查收入数目的合法性
function setSalary(salary) {
    if (isNaN(salary) || salary < 0) {
        return '';
    }
    if (salary > 100) {
        return Math.ceil(salary / 1000) / 10;
    }
    return salary;
}

// 设置就业失业登记证号，传入参数为个人信息条目
function setWorkRegisterId(d) {
    var idNumber = d.idNumber;
    if (staticData.workRegisterId.hasOwnProperty(idNumber)) {
        d.workRegisterId = staticData.workRegisterId[idNumber];
    }
}

// 查询已享受就业服务，并处理职业培训类型和名称，传入参数为个人信息条目
function setPostService(d) {
    var idNumber = d.idNumber;
    var service = [];
    if (staticData.workRecommend.hasOwnProperty(idNumber)) {
        service.push(0);
    }
    if (staticData.vocationalTraining.hasOwnProperty(idNumber) ||
        staticData.startupTraining.hasOwnProperty(idNumber)) {
        service.push(1);
        // 设置培训信息
        if (staticData.vocationalTraining.hasOwnProperty(idNumber)) {
            d.trainingType = '职业培训';
            d.postTraining = staticData.vocationalTraining[idNumber];
        } else {
            d.trainingType = '创业培训';
            d.postTraining = staticData.startupTraining[idNumber];
        }
    } else {
        // 如果培训名称为空，则培训类型为无
        if (!d.postTraining || !d.postTraining.trim())
        d.trainingType = '无';
    }
    if (staticData.technicalGrade.hasOwnProperty(idNumber)) {
        d.technicalGrade = staticData.technicalGrade[idNumber];
        service.push(2);
    } else {
        d.technicalGrade = '无';
    }
    if (staticData.socialSubsidy.hasOwnProperty(idNumber)) {
        service.push(3);
    }
    if (staticData.publicWelfare.hasOwnProperty(idNumber)) {
        service.push(4);
    }
    if (staticData.securedLoan.hasOwnProperty(idNumber)) {
        service.push(5);
    }
    if (staticData.internship.hasOwnProperty(idNumber)) {
        service.push(6);
    }

    d.postService = service;
}

// 设置服务需求，传入参数为个人信息条目
function setPreferredService(o) {
    if (!o) {
        return;
    }
    var service = [];
    var s = o.preferredService;
    //console.log(s);
    if (!s || !s.trim()) {
        return;
    }

    for (var i = 1; i < 8; i++) {
        if (s.search(i) != -1) {
            service.push(i);
        }
    }
    o.preferredService = service;
    // 去除数字、空格及逗号（英文及中文模式）
    s = s.replace(/[\d\s,，]/g, '');
    if (s) {
        o.extraPreferredService = s;
    }
    //console.log(o);
}
// 测试
//var obj = {preferredService: '2,3钳工'};
//setPreferredService(obj);
//console.log(obj);

// 由工种名称查询编号
function lookupJobIdFromName(job) {
    if (!job) {
        return [];
    }
    if (job == '其它') {
        return  ['D01'];
    }
    var i, j, tmp;
    var jobId = [];
    for (i = 0; i < 4; i++) {
        //console.log(staticData.jobType);
        tmp = staticData.jobType.local['ABCD'[i]];
        //console.log(tmp);
        for (j in tmp) {
            if (!tmp.hasOwnProperty(j)) {
                continue;
            }
            if (job.search(tmp[j]) != -1) {
                jobId.push(j);
            }
        }
    }
    return jobId;
}
// 测试例子
//console.log('分析工种：' + lookupJobIdFromName('组合机床操作工, 磨./工'));

// 设置工作类型，必须用编码替代名称，传入参数为个人信息条目
function setJobType(o) {
    var d;
    if (o && o.employmentInfo) {
        d = o.employmentInfo.jobType;
        d = lookupJobIdFromName(d)[0];
        o.employmentInfo.jobType = d ? d : '';
    }
    if (o && o.unemploymentInfo) {
        d = o.unemploymentInfo.preferredJobType;
        o.unemploymentInfo.preferredJobType = lookupJobIdFromName(d);
    }
}

// 设置参加保险情况，必须用序号替代名称，传入参数为个人信息条目
function setInsurance(o) {
    if (!o) {
        return;
    }
    var insure = o.insurance;
    insure = insure ? insure : [];
    if (o.censusRegisterType == '农业户口') {
        insure[2] = '参保';
        insure[7] = '参保';
        insure[1] = '';
        insure[4] = '';
    } else if (o.censusRegisterType == '非农业户口') {
        insure[1] = '参保';
        insure[4] = '参保';
        insure[2] = '';
        insure[7] = '';
    }

    var idNumber = o.idNumber;
    if (staticData.workInjuryInsurance.hasOwnProperty(idNumber)) {
        insure[6] = '参保';
    }
    if (staticData.unemployedInsurance.hasOwnProperty(idNumber)) {
        insure[5] = '参保';
    }
    if (staticData.orgMedicalInsurance.hasOwnProperty(idNumber)) {
        insure[3] = '参保';
    }
    if (staticData.orgRetireInsurance.hasOwnProperty(idNumber)) {
        insure[0] = '参保';
    }

    var insurance = [];
    for (var i = 0; i < insure.length; i++) {
        if (insure[i] == '参保') {
            insurance.push(i);
        }
    }
    o.insurance = insurance;
}
//测试
//var obj = {
//    idNumber: '432902197201110050',
//    censusRegisterType: '非农业户口',
//    insurance: ['参保', '', '参保', '', '', '', '', '']
//};
//setInsurance(obj);
//console.log(obj);

// 补足部分在册数据，修复部分填入错误的数据，传入参数为个人信息条目
function formatData(d) {
    if (!d || !d[1]) {
        console.log('从excel文件读取的用户信息有误！');
        return;
    }
    d[6] = d[6].toString();
    if (!validIdNumber(d[6])) {
        console.log('身份证号有误：' + d[6]);
        return;
    }

    var o = {
        username: d[5],
        idNumber: d[6],
        nation: d[11],
        // readonly basic info
        age: getAge(d[6].slice(6, 14)),
        birthday: d[6].slice(6, 14),
        gender: getGender(d[6]),
        workRegisterId: d[7],
        address: {
            county: d[2],
            town: d[3],
            village: d[4]
        },
        districtId: d[1],
        // still basic info
        education: d[13],
        //graduateDate: Number,
        phone: d[16],
        censusRegisterType: d[14],
        politicalOutlook: d[12],
        marriage: d[15],
        // training and service info
        trainingType: d[18],
        postTraining: d[19],
        technicalGrade: d[21],
        //postService: [String],
        //extraPostService: '',
        // employment/unemployment switch
        //employment: String,
        // employment info
        employmentInfo: {
            employer: d[23],
            jobType: d[24],////
            industry: d[25],
            startWorkDate: d[26],
            workplace: d[27],
            workProvince: d[28],
            salary: d[29],
            jobForm: d[30]
        },
        // unemployment info
        unemploymentInfo: {
            humanCategory: d[31],
            unemployedDate: d[32],
            unemploymentCause: d[33],
            familyType: d[34],
            preferredJobType: d[35], ////
            //extraPreferredJobType: String,
            preferredSalary: d[37],
            preferredIndustry: d[36],
            preferredWorkplace: d[38],
            preferredJobForm: d[39],
            preferredService: d[40], /////
            //extraPreferredService: String,
            preferredTraining: d[41]
        },
        // insurance info
        insurance: d.slice(42, 50), ////
        // editor info
        editor: '电脑操作员',
        modifiedDate: new Date()
    };
    var county = getCountyId();
    if (o.districtId.slice(0, 6) != county && o.districtId.length < 10) {
        console.log('行政区划代码有误');
        return null;
    }
    var town = o.districtId.slice(0, 8);
    var village = o.districtId.slice(0, 10);
    //var townName = '';
    //var villageName = '';
    if (!district[county].hasOwnProperty(town) ||
        !district[town].hasOwnProperty(village)) {
        console.log('行政区划代码超出范围：' + o.districtId);
        console.log('试图通过分析地名更正行政区划代码！');
        var newId = parseDistrictIdFromName(o.address);
        if (!newId) {
            console.log('无法更正行政区划代码异常***');
            return;
        }
        town = newId.slice(0, 8);
        village = newId.slice(0, 10);
    }
    // 填写地址信息
    o.address = {
        county: district['4311'][county],
        town: district[county][town],
        village: district[town][village]
    };
    // 校正出生日期
    o.birthday = o.idNumber.toString().slice(6, 14);

    // 校验就业/失业时间，并进行一定纠正
    setDate(o);
    // 判断是否已经就业，如果未填写任何已就业信息，则表示未就业
    if (!d[23] && !d[24] && !d[25] && !d[26] &&
        !d[27] && !d[28] && !d[29] && !d[30]) {
        o.employment = '暂未就业';
        o.employmentInfo = undefined;
    } else {
        o.employment = '已就业';
        o.unemploymentInfo = undefined;
    }
    if (!validPhone(o.phone)) {
        console.log('电话号码有误！将被清空。原填入号码为：' + o.phone);
        o.phone = '';
    }
    setWorkRegisterId(o);
    setPostService(o);
    setSalary(o);
    setPreferredService(o);
    setJobType(o);
    setInsurance(o);

    return o;
}

// 读取excel（xlsx）文件，分析返回数组，元素为人员信息条目
function parseExcel(filename, firstLine) {
    var start = firstLine ? firstLine : 7;
    try {
        var workbook = xlsx.readFile(filename);
    } catch (e) {
        console.log('读取文件错误，文件名：' + filename);
        console.log('读取文件错误：' + e);
        return;
    }

    if (workbook.SheetNames.length > 1 || workbook.SheetNames.length == 0) {
        console.log(filename + '工作表有异常！');
        return;
    }
    var sheetName = workbook.SheetNames[0];
    console.log(filename + '有工作表：' + sheetName);
    var sheet = workbook.Sheets[sheetName];
    if (!sheet['!ref']) {   // 空文件的情况
        return;
    }
    var range = sheet['!ref'].split(':')[1];
    if (isNaN(range.slice(2))) {
        console.log(filename + '工作表有异常！');
        return;
    }
    var end = range.slice(2);
    var itemList = [];
    var item, j, tmp;
    var index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = start; i <= end; i++) {
        item = [];
        for (j = 0; j < 26; j++) {
            tmp = sheet[index[j] + i];
            item[j] = tmp ? tmp.v : '';
        }
        for (j = 26; j < 50; j++) {
            tmp = sheet['A' + index[j - 26] + i];
            item[j] = tmp ? tmp.v : '';
        }
        itemList.push(item);
    }
    return itemList;
}

// 测试语句
//var data = parseExcel('excel/test.xlsx');
//for (var i = 0; i < 10; i++) {
//    console.log(formatData(data[i]));
//}