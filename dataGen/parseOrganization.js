var fs = require('fs');
var districtId = require('./data.lanShan/districtId');
var simpleId = require('./data.lanShan/districtIdSimple');

var f0 = './data.lanShan/非行政事业单位.txt';
var f1 = './data.lanShan/国有单位.txt';

var fBase = './base.txt';

var fCopId = './data.lanShan/corporationId.txt';
var fCopType = './data.lanShan/corporationType.txt';
var fOut = './data.lanShan/typeOut.txt';

function addTypeCol() {
    var copId = getDataWin(fCopId);
    var copType = getDataWin(fCopType);
    var row, tmp;
    for (var i = 0; i < copId.length; i++) {
        row = searchId(copId[i], copType);
        if (row) {
            tmp = copAndEcoType(row[3], row[2]);
            copId[i][1] = tmp.cop;
            copId[i][2] = tmp.eco;
            tmp = businessAndIndustry(row[1]);
            copId[i][3] = tmp.b;
            copId[i][4] = tmp.i;
        } else {
            copId[i][1] = '';
            copId[i][2] = '';
            copId[i][3] = '';
            copId[i][4] = '';
        }
    }
    console.log(copId.length);
    for (i = 0; i < copId.length; i++) {
        copId[i] = copId[i].join('\t');
    }
    fs.writeFileSync(fOut, copId.join('\r\n'));
}

addTypeCol();

function searchId(cId, dic) {
    for (var i = 0; i < dic.length; i++) {
        if (dic[i][0] == cId) {
            return dic[i];
        }
    }
    return false;
}

function copAndEcoType(cop, eco) {
    var copType = {
            '10': '企业',
            '30': '机关',
            '20': '事业单位',
            '40': '社会团体',
            '50': '其他',
            '52': '其他',
            '53': '其他',
            '54': '其他',
            '90': '其他'
        };
    var ecoType = {
            '110': '国有全资',
            '120': '集体全资',
            '130': '股份合作',
            '140': '其他',
            '141': '国有全资',
            '142': '集体全资',
            '143': '国有全资',
            '149': '其他',
            '150': '股份合作',
            '151': '国有全资',
            '159': '股份合作',
            '160': '股份合作',
            '170': '私营企业',
            '171': '私营企业',
            '172': '私营企业',
            '173': '私营企业',
            '174': '私营企业',
            '175': '个体工商',
            '190': '其他',
            '210': '港、澳、台',
            '220': '港、澳、台',
            '230': '港、澳、台',
            '240': '港、澳、台',
            '310': '中外合资',
            '320': '中外合资',
            '330': '中外合资',
            '340': '中外合资'
        };
    var ct = copType[cop];
    ct = ct ? ct : '其他';
    var et = ecoType[eco];
    et = et ? et : '其他';
    return {cop: ct, eco: et};
}

function businessAndIndustry(copId) {
    var cId = copId.slice(0, 2);
    if (cId <= 5) {
        return {b: '农林牧渔', i: '第一产业'};
    }
    if (6 <= cId && cId <= 12) {
        return {b: '采掘', i: '第二产业'};
    }
    if (13 <= cId && cId <= 43) {
        return {b: '制造', i: '第二产业'};
    }
    if (44 <= cId && cId <= 46) {
        return {b: '电力、煤气及水', i: '第二产业'};
    }
    if (47 <= cId && cId <= 50) {
        return {b: '建筑', i: '第二产业'};
    }
    if (53 <= cId && cId <= 60) {
        return {b: '交通运输仓储邮电通信', i: '第三产业'};
    }
    if (63 <= cId && cId <= 65) {
        return {b: '信息、计算机', i: '第三产业'};
    }
    if (51 <= cId && cId <= 52) {
        return {b: '批发零售', i: '第三产业'};
    }
    if (61 <= cId && cId <= 62) {
        return {b: '住宿餐饮', i: '第三产业'};
    }
    if (66 <= cId && cId <= 69) {
        return {b: '金融', i: '第三产业'};
    }
    if (cId == 70) {
        return {b: '房地产', i: '第三产业'};
    }
    if (71 <= cId && cId <= 72) {
        return {b: '租赁商务服务', i: '第三产业'};
    }
    if (73 <= cId && cId <= 75) {
        return {b: '科学技术地质勘查', i: '第三产业'};
    }
    if (76 <= cId && cId <= 78) {
        return {b: '水利环境公共设施管理', i: '第三产业'};
    }
    if (79 <= cId && cId <= 81) {
        return {b: '居民服务其它服务业', i: '第三产业'};
    }
    if (cId == 82) {
        return {b: '教育', i: '第三产业'};
    }
    if (cId == 83) {
        return {b: '卫生社会保障公共设施管理', i: '第三产业'};
    }
    if (85 <= cId && cId <= 89) {
        return {b: '文化体育娱乐', i: '第三产业'};
    }
    if (90 <= cId && cId <= 95) {
        return {b: '公共管理社会组织', i: '第三产业'};
    }
    if (cId == 96) {
        return {b: '国际组织', i: '第三产业'};
    }
    return {b: '其他', i: '其它'};
}

function getData(file) {
    var f = fs.readFileSync(file);
    f = f.toString().split('\n');
    var d = [];
    for (var i = 0, len = f.length; i < len; i++) {
        d[i] = f[i].split(',');
    }
    return d;
}

function getDataWin(file) {
    var f = fs.readFileSync(file);
    f = f.toString().split('\r\n');
    var d = [];
    for (var i = 0, len = f.length; i < len; i++) {
        d[i] = f[i].split('\t');
    }
    return d;
}

function locate(row) {
    var tmp;
    var tmp1 = row[5];
    var tmp2 = row[13];
    var town = simpleId['431127'];
    for (var i in town) {
        if (!town.hasOwnProperty(i)) {
            continue;
        }
        if (tmp1 && tmp1.search(town[i]) != -1) {
            row[3] = districtId['431127'][i];
            row[1] = i;
            if (row[13] == '') {
                row[13] = row[3] + row[4];
            }
            break;
        }
        if (tmp2 && tmp2.search(town[i]) != -1) {
            row[3] = districtId['431127'][i];
            row[1] = i;
            break;
        }
    }
    if (row[1] && row[1].search('431127') != -1) {
        if (!simpleId.hasOwnProperty(row[1])) {
            return row;
        }
        tmp = simpleId[row[1]];
        for (var v in tmp) {
            if (!tmp.hasOwnProperty(v)) {
                continue;
            }
            if (tmp1 && tmp1.search(tmp[v]) != -1) {
                row[4] = districtId[row[1]][v];
                if (row[13] == '') {
                    row[13] = row[3] + row[4];
                }
                return row;
            }
            if (tmp2 && tmp2.search(tmp[v]) != -1) {
                row[4] = districtId[row[1]][v];
                return row;
            }
        }
        return row;
    }
    for (i in town) {
        if (!town.hasOwnProperty(i) || !simpleId.hasOwnProperty(i)) {
            continue;
        }
        for (var j in simpleId[i]) {
            if (!simpleId[i].hasOwnProperty(j)) {
                continue;
            }
            if (tmp1 && tmp1.search(simpleId[i][j]) != -1) {
                row[1] = j;
                row[3] = districtId['431127'][i];
                row[4] = districtId[i][j];
                if (row[13] == '') {
                    row[13] = row[3] + row[4];
                }
                return row;
            }
            if (tmp2 && tmp2.search(simpleId[i][j]) != -1) {
                row[1] = j;
                row[3] = districtId['431127'][i];
                row[4] = districtId[i][j];
                return row;
            }
        }
    }

    /*
    if (tmp1 || tmp2) {
        for (var i in town) {
            if (!town.hasOwnProperty(i)) {
                continue;
            }
            if (tmp2 && tmp2.search(town[i]) != -1) {
                row[3] = districtId['431127'][i];
                row[1] = i;
                for (var j in simpleId[i]) {
                    if (!simpleId[i].hasOwnProperty(j)) {
                        continue;
                    }
                    if (tmp2 && tmp2.search(simpleId[i][j]) != -1) {
                        row[4] = districtId[i][j];
                        row[1] = j;
                        row[3] = districtId['431127'][i];
                        return row;
                    }
                }
            } else if (tmp1 && tmp1.search(town[i]) != -1) {
                row[3] = districtId['431127'][i];
                row[1] = i;
                for (j in simpleId[i]) {
                    if (!simpleId[i].hasOwnProperty(j)) {
                        continue;
                    }
                    if (tmp1 && tmp1.search(simpleId[i][j]) != -1) {
                        row[4] = districtId[i][j];
                        row[1] = j;
                        row[3] = districtId['431127'][i];
                        return row;
                    }
                }
            }
            if (!simpleId.hasOwnProperty(i)) {
                continue;
            }
            for (j in simpleId[i]) {
                if (!simpleId[i].hasOwnProperty(j)) {
                    continue;
                }
                if (tmp2 && tmp2.search(simpleId[i][j]) != -1) {
                    row[4] = districtId[i][j];
                    row[1] = j;
                    row[3] = districtId['431127'][i];
                    return row;
                } else if (tmp1 && tmp1.search(simpleId[i][j]) != -1) {
                    row[4] = districtId[i][j];
                    row[1] = j;
                    row[3] = districtId['431127'][i];
                    return row;
                }
            }
        }
    }
    */

    if (!row[1] || row[1].search('431127') == -1) {
        row[1] = '43112701';
        row[3] = districtId['431127']['43112701'];
        row[13] = row[3];
    }
    if (row[13] == '') {
        row[13] = row[3] + row[4];
    }
    return row;
}

function fill35Less(data) {
    for (var i = 0; i < data.length; i++) {
        data[i][25] = Math.floor(data[i][21] / 4) +
            Math.floor(data[i][21] * Math.random() / 2);
    }
    return data;
}

//fillAddress('base.txt');

function fillAddress(path) {
    var file = fill35Less(getDataWin(path));
    for (var i = 0; i < file.length; i++) {
        file[i] = locate(file[i]);
    }
    console.log(file);
    for (i = 0; i < file.length; i++) {
        file[i] = file[i].join('\t');
    }
    fs.writeFileSync('outFile.txt', file.join('\r\n'));
}

function nationCop(d) {
    var data = [];
    var row;
    for (var i = 0, j = 872, len = d.length; i < len; i++) {
        if (!/\w/.test(d[i][0])) {
            continue;
        }
        j++;
        // 序号
        row = [j];
        // 行政区划代码
        row[1] = '';
        // 县市
        row[2] = districtId['4311']['431127'];
        // 乡镇
        row[3] = '';
        // 村
        row[4] = '';
        // 单位名称
        row[5] = d[i][1];
        // 组织机构代码
        row[6] = d[i][0];
        // 法人
        row[7] = d[i][2];
        // 联系人
        row[8] = d[i][2];
        // 电话
        row[9] = '';
        // 传真
        row[10] = '';
        // 邮编
        row[12] = '';
        // 地址
        row[13] = '';
        // 总就业人数
        row[21] = d[i][3];
        // 女性人数
        row[24] = d[i][4];
        // 保险
        row[33] = '参保';
        row[34] = '参保';
        row[35] = '参保';
        row[36] = '参保';
        row[37] = '参保';
        data.push(row);
    }
    return data;
}

// 以非行政事业单位为基础
function baseTable(d) {
    var data = [];
    var row;
    for (var i = 0, j = 0, len = d.length; i < len; i++) {
        if (!/\w/.test(d[i][0])) {
            continue;
        }
        j++;
        // 序号
        row = [j];
        // 行政区划代码
        row[1] = '';
        // 县市
        row[2] = districtId['4311']['431127'];
        // 乡镇
        row[3] = '';
        // 村
        row[4] = '';
        // 单位名称
        row[5] = d[i][1];
        // 组织机构代码
        row[6] = d[i][0];
        // 法人
        row[7] = d[i][3];
        // 联系人
        row[8] = d[i][3];
        // 电话
        if (d[i][4]) {
            row[9] = '0746' + d[i][4];
            // 传真
            row[10] = row[9];
        } else if (d[i][5]) {
            row[9] = d[i][5];
        }
        // 邮编
        row[12] = d[i][6];
        // 地址
        row[13] = d[i][2];
        // 总就业人数
        row[21] = d[i][9];
        // 女性人数
        row[24] = d[i][10];

        data.push(row);
    }
    return data;
}

function exportData() {
    var base = baseTable(getData(f0));
    for (var i = 0; i < base.length; i++) {
        base[i] = base[i].join('\t');
    }
    fs.writeFileSync('./base0.txt', base.join('\r\n'));

    base = nationCop(getData(f1));
    for (i = 0; i < base.length; i++) {
        base[i] = base[i].join('\t');
    }
    fs.writeFileSync('./base1.txt', base.join('\r\n'));
}

//exportData();

//console.log(JSON.stringify(baseTable(getData(f0)), undefined ,4));