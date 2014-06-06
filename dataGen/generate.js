var nameResource = require('./name');
var staticData = require('./staticData');

var district = require('../hrSys/config/districtId');
var jobTypeList = require('../hrSys/config/jobType');
var db = require('../hrSys/routes/db');

// 速写方式
var random = Math.random;
var floor = Math.floor;
// 随机生成姓名
function name(nameSrc) {
    var name = '';
    var index = random() * nameSrc.surname.length;
    // 让生成的随机数更集中在索引的靠前位置，以引用更常见的姓氏
    index = floor(random() * random() * index);
    //console.log('index: ' + index);
    name += nameSrc.surname.charAt(index);
    index = floor(random() * nameSrc.name.length);
    // 以80%的概率生成两个字的名字，其余20%的为单名
    //console.log('index: ' + index);
    if (random() < 0.8) {
        if (index % 2 == 0) {
            name += nameSrc.name.slice(index, index + 2);
        } else {
            name += nameSrc.name.slice(index - 1, index + 1);
        }
    } else {
        name += nameSrc.name.charAt(index);
    }
    return name;
}

// 随机生成地址，包括districtId, county, town, village，依赖于外部district数据
// 有31个乡镇级区域，每个区域有不同村落和社区，最大的区域有43个村落或社区
function address(townN, villageN) {
    var address = {county: '永州市蓝山县'};
    var townIndex = random() * townN;
    // 让生成的随机数更集中在索引的靠前位置，以引用人口更多的区域
    townIndex = floor(random() * random() * townIndex);
    townIndex = 43112701 + townIndex;
    address.town = district['431127'][townIndex.toString()];

    var town = district[townIndex.toString()];
    var villageIndex = floor(random() * villageN);
    var i = '';
    while (villageIndex > 0) {
        // 生成索引字符串
        i = townIndex * 100 + villageIndex + 1 + '';
        if (town.hasOwnProperty(i)) {
            address.village = town[i];
            address.districtId = i;
            break;
        }
        villageIndex >>= 1;
    }
    if (villageIndex == 0) {
        i = townIndex * 100 + 1 + '';
        address.village = town[i];
        address.districtId = i;
    }
    return address;
}

function dateFmt(t) {
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    // 转变为为2个字节的字符串
    month = (month < 10 ? '0' : '') + month;
    var day = t.getDate();
    // 转变为为两个字节的字符串
    day = (day < 10 ? '0' : '') + day;
    return year + month + day;
}

function birthday() {
    var year = floor(25 * random() * random());
    var age = 40 + (random() < 0.5 ? year : -year);
    var yearMs = 1000 * 60 * 60 * 24 * 365;
    var time = new Date(Date.now() - age * yearMs);
    return dateFmt(time);
}

function idNumber(birth) {
    //create district id
    var district = '432927';
    if (random() < 0.5) {
        district = '431127';
    } else if (random() < 0.2) {
        district = floor(random() * 9) + 1 + '';
        for (i = 0; i < 5; i++) {
            district += floor(random() * 10);
        }
    }
    // create serial number
    var serial = '';
    for (i = 0; i < 3; i++) {
        serial += floor(random() * 10);
    }

    // create checksum byte
    var partialId = district + birth + serial;
    var weights = [
        '7', '9', '10', '5', '8', '4', '2', '1', '6',
        '3', '7', '9', '10', '5', '8', '4', '2', '1'
    ];
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        var digit = partialId.charAt(i);
        sum += digit * weights[i];
    }
    sum = (12 - sum % 11) % 11;
    // checksum byte
    sum = (sum == 10 ? 'X' : sum.toString());

    return partialId + sum;
}

function workRegisterId() {
    var serial = '';
    for (var i = 0; i < 10; i++) {
        serial += floor(random() * 10);
    }
    return random() < 0.5 ? '' : '431127' + serial;
}

// 由身份证号得到年龄
function age(idNumber) {
    var now = (new Date()).getFullYear();
    var year = idNumber.slice(6, 10);
    return now - year;
}

// 由身份证号得到性别
function gender(idNumber) {
    return idNumber.charAt(16) % 2 ? '男' : '女';
}

function nation(nations) {
    if (random() < 0.6) {
        return nations[0];
    }
    if (random() < 0.5) {
        return nations[12];
    }
    var index = floor(random() * nations.length);
    return nations[index];
}

// 返回学历和毕业时间，毕业时间可能是空字符串
function graduation(age, grade) {
    var education = '';
    var graduateDate = '';
    if (age < 22) {
        education = grade[floor(random() * 4) + 2];
    } else {
        var index = floor(random() * 6);
        education = grade[index];
        if (index < 2) {
            // 直接设定大学或大专毕业时为22岁
            graduateDate = (new Date()).getFullYear() - age + 22;
        }
    }
    return {
        education: education,
        graduateDate: graduateDate
    };
}

function phone() {
    var n = '13';
    for (var i = 0; i < 9; i++) {
        n += floor(random() * 10);
    }
    return n;
}

// 依赖外部数据
function censusRegisterType(districtId) {
    var types = ['非农业户口', '农业户口'];
    var town = district[districtId.slice(0, 8)];
    var index = random();
    if (/村$/.test(town[districtId])) {
        return index < 0.9 ? types[1] : types[0];
    } else {
        return index < 0.9 ? types[0] : types[1];
    }
}

function marriage(age) {

    var index = random();
    if (age > 40 && index < 0.99) {
        return '已婚';
    }
    if (Math.pow(10, age / 10) * index > 100) {
        return '已婚';
    }
    return '未婚';
}

function politicalOutlook(types) {
    var index = random();
    if (index < 0.9) {
        return types[1];
    }
    index = floor(random() * types.length);
    return types[index];
}

// 包含培训类型trainingType和培训项目postTraining
function training(types, lists) {
    //var index = random();
    var type = '无';
    var list = '';
    if (random() < 0.2) {
        type = types[floor(random() * 3) + 1];
        list = lists[floor(random() * lists.length)];
    }
    return {
        trainingType: type,
        postTraining: list
    };
}

// 技术等级
function technicalGrade(grade) {
    if (random() < 0.8) {
        return grade[0];
    }
    return grade[floor(random() * (grade.length - 1)) + 1]
}

function service(ser) {
    var serList = [];
    for (var i = 0; i < ser.length; i++) {
        if (random() < 0.01) {
            serList.push(i);
        }
    }
    return serList;
}

function employer(nameSrc) {
    var postfix = ['技术有限公司', '设备制造厂', '贸易有限公司',
        '设计院', '商场', '娱乐城', '协会', '联合会', '基金会'];
    var index = floor(random() * nameSrc.length) * 4 % nameSrc.length;
    return nameSrc.slice(index, index + 4) +
        postfix[floor(random() * postfix.length)];
}

function jobType(list) {
    var category = [];
    var types = [];
    for (var a in list) {
        if (!list.hasOwnProperty(a)) {
            continue;
        }
        category.push(a);
        for (var b in list[a]) {
            if (!list[a].hasOwnProperty(b)) {
                continue;
            }
            types.push(b);
        }
    }
    if (random() < 0.2) {
        return category[floor(random() * category.length)];
    }
    return types[floor(random() * types.length)];
}

function industry(type) {
    return type[floor(random() * type.length)];
}

function startWorkDate(age) {
    var yearMs = 1000 * 60 * 60 * 24 * 365;
    var before = (age - 15) * random() * yearMs;
    if (age == 15) {
        before = 0.5 * random() * yearMs;
    }
    var time = new Date(Date.now() - before);

    return dateFmt(time);
}

// 放回工作地点workplace，及外省名称（如果有）workProvince
function workplace(place, provinces) {
    var province = '';
    if (random() < 0.5) {
        return {
            workplace: place[0],
            workProvince: ''
        };
    }
    var spot =  place[floor(random() * place.length)];
    if (spot == '省外' && random() < 0.5) {
        province = '广东省';
    } else if (spot == '省外') {
        province = provinces[floor(random() * provinces.length)];
    }
    return {
        workplace: spot,
        workProvince: province
    };
}

function salary() {
    //return (Math.pow(random(), 2) * 300) / 10 + 1;
    return floor(Math.pow(30, random()) * random() * 10) / 10 + 1;
}

// 就业形式
function jobForm(form) {
    return form[floor(random() * form.length)];
}

// 人员身份
function humanCategory(censusReg, age, edu) {
    var edus = staticData.education;
    if (age < 30 && (edu == edus[0] || edu == edus[1])) {
        return staticData.humanCategory[2];
    }
    if (random() < 0.1) {
        return staticData.humanCategory[3];
    }
    var index = floor(random() * 2);
    if (censusReg == '农业户口') {
        return staticData.humanCategory[index];
    } else {
        return staticData.humanCategory[index + 4]
    }
}

// 失业时间
function unemployedDate(age) {
    var yearMs = 1000 * 60 * 60 * 24 * 365;
    var span = (Math.sqrt(age - 13) - 1) * yearMs * random();
    var time = new Date(Date.now() - span);
    return dateFmt(time);
}

// 失业原因
function unemploymentCause(age, humanCate) {
    var cause = staticData.unemploymentCause;
    if (age <= 28) {
        return random() < 0.8 ? cause[4] : cause[0];
    }
    if (humanCate == '复员军人') {
        return cause[5];
    }
    if (random() < 0.1) {
        return cause[6]
    }
    return cause[floor(random() * 4)]
}

// 困难群体情况
function familyType(age, humanCate) {
    var birth = (new Date()).getFullYear() - age;
    var types = staticData.familyType;
    if (birth <= 1960) {
        return types[0];
    }
    if (humanCate == '复员军人') {
        return types[1];
    }
    return types[floor(random() * 7) + 2];
}

// 参保情况
function insurance(censusReg) {
    var ins = staticData.insurance;
    var list = [4, 1, 0, 3, 5, 6];
    if (censusReg == '农业户口') {
        list = [7, 2 , 5, 6];
    }
    var insurs = [];
    if (random() < 0.8) {
        if (random() < 0.5) {
            insurs.push(ins[list[0]]);
        }
        if (random() < 0.5) {
            insurs.push(ins[list[1]]);
        }
    }
    for (var i = 2; i < list.length; i++) {
        if (random() < 0.1) {
            insurs.push(ins[list[i]]);
        }
    }
    return insurs;
}

function modifiedDate() {
    var year = 1000 * 60 * 60 * 24 * 365;
    return new Date(Date.now() - random() * year * 3);
}

function createRandomDate(employed) {
    var msg = {
        username: name(nameResource),
        nation: nation(staticData.nation),
        idNumber: idNumber(birthday()),
        workRegisterId: workRegisterId(),
        phone: phone(),
        politicalOutlook: politicalOutlook(staticData.politicalOutlook),
        technicalGrade: technicalGrade(staticData.technicalGrade),
        postService: service(staticData.serviceType),
        extraPostService: service(staticData.extraService).join(',')
    };
    var tmp = msg.idNumber;
    msg.age = age(tmp);
    msg.gender = gender(tmp);
    tmp = address(31, 43);
    msg.address = tmp;
    msg.districtId = tmp['districtId'];
    tmp = graduation(msg.age, staticData.education);
    msg.education = tmp.education;
    msg.graduateDate = tmp.graduateDate;
    msg.censusRegisterType = censusRegisterType(msg.districtId);
    msg.marriage = marriage(msg.age);
    tmp = training(staticData.trainingType, staticData.training);
    msg.trainingType = tmp.trainingType;
    msg.postTraining = tmp.postTraining;

    msg.employmentInfo = {
        employer: employer(nameResource.name),
        jobType: jobType(jobTypeList),
        industry: industry(staticData.industry),
        startWorkDate: startWorkDate(msg.age),
        salary: salary(),
        jobForm: jobForm(staticData.jobForm)
    };
    tmp = workplace(staticData.workplace, staticData.province);
    msg.employmentInfo.workplace = tmp.workplace;
    msg.employmentInfo.workProvince = tmp.workProvince;

    msg.unemploymentInfo = {
        humanCategory: humanCategory(msg.censusRegisterType,
            msg.age, msg.education),
        unemployedDate: unemployedDate(msg.age),
        unemploymentCause: unemploymentCause(msg.age, msg.humanCategory),
        familyType: familyType(msg.age, msg.humanCategory),
        preferredJobType: jobType(jobTypeList),
        preferredSalary: salary(),
        preferredIndustry: industry(staticData.industry),
        preferredWorkplace: workplace(staticData.workplace,
            staticData.province),
        preferredJobForm: jobForm(staticData.jobForm),
        preferredService: service(staticData.serviceType),
        extraPreferredService: service(staticData.extraService),
        preferredTraining: training(staticData.trainingType,
            staticData.training).trainingType
    };

    msg.insurance = insurance(msg.censusRegisterType);
    msg.editor = modifiedDate();

    if (random() < 0.4) {
        msg.employment = '已就业';
        msg.unemploymentInfo = null;
    } else {
        msg.employment = '暂未就业';
        msg.employmentInfo = null;
    }

    return msg;
}

function addRandomData(n) {
    for (var i = 0; i < n; i++) {
        db.save(createRandomDate());
    }
}

addRandomData(10000);

// only for basic function test
//console.dir(createRandomDate());
//for (var i = 0; i < 20; i++) {
    //console.log(name(nameResource));
    //console.log(JSON.stringify(address(31, 43)));
    //console.dir(address(31, 43));
    //console.log(birthday());
    //console.log(idNumber(birthday()));
    //console.log(nation(staticData.nation));
    /*var ages = floor(random() * 100);
    console.log('age: ' + ages);
    console.dir(graduation(ages, staticData.education));
    */
    //console.log('phone: ' + phone());
    //var area = address(31, 43)['districtId'];
    //console.log(district[area.slice(0, 8)][area]);
    //console.log(censusRegisterType(area.toString()));
    //console.log(politicalOutlook(staticData.politicalOutlook));
    //console.log(marriage(40));
    //console.dir(training(staticData.trainingType, staticData.training));
    //console.log(technicalGrade(staticData.technicalGrade));
    //console.dir(service(staticData.serviceType));
    //console.log(employer(nameResource.name));
    //console.log(jobType(jobTypeList));
    //console.log(startWorkDate(40));
    //console.log(dateFmt(new Date(Date.now() - random() * 100000000000)));
    //console.dir(workplace(staticData.workplace, staticData.province));
    //console.log(salary());
    //console.log(jobForm(staticData.jobForm));
    /*
    console.log(humanCategory(censusRegisterType(area), 28,
        graduation(28, staticData.education)));
    */
    /*
    var humanCate = humanCategory(censusRegisterType(area), 28,
        graduation(28, staticData.education));
    console.log(unemploymentCause(32, humanCate));
    */
    //var myAge = floor(random() * 50 + 15);
    //console.log(myAge + ':' + unemployedDate(myAge));
    /*
    var theAge = 15 + floor(random() * 50);
    var humanCate = humanCategory(censusRegisterType(area), theAge,
        graduation(theAge, staticData.education));
    console.log(familyType(theAge, humanCate));
    */
    //var censusReg = censusRegisterType(area);
    //console.log(insurance(censusReg));
    //console.dir(modifiedDate());
//}