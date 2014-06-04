// 验证身份证号的合法性
function validIdNumber(idNumber) {
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
        if (isNaN(digit)) {
            return false;
        }
        sum += digit * weights[i];
    }
    sum = (12 - sum % 11) % 11;
    return sum == 10 && idNumber.charAt(17).toLowerCase() == 'x' ||
        sum < 10 && sum == idNumber.charAt(17);
}

// 由身份证号得到年龄
function getAge(idNumber) {
    if (!validIdNumber(idNumber)) {
        return '';
    }
    var now = (new Date()).getFullYear();
    var year = idNumber.slice(6, 10);
    return now - year;
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
    return !isNaN(phone) && 6 < phone.length && phone.length < 13;
}

// 检查年月日的合法性，格式为：YYYYMMDD
function validDate(d) {
    return d.length == 8 && !isNaN(d) && d.slice(0, 4) < 2100 &&
        d.slice(4, 6) < 13 && d.slice(6) < 32;
}

// 检查收入数目的合法性
function validSalary(salary) {
    return !isNaN(salary);
}
// 页面装载完成后执行
$(function() {
    // 校验身份证号，自动填入年龄性别
    $('input[name=idNumber]').blur(function(e) {
        var value = e.target.value.trim();
        // 校验身份证号
        if (!validIdNumber(value)) {
            if (confirm("身份证号码输入有误，需重新输入！")) {
                setTimeout(function() {
                    $('input[name=idNumber]').focus();
                }, 10);
            }
        }
        // 如果身份证末尾为'x'，改为大写字母
        $('input[name=idNumber]').val(value.toUpperCase());
        // 自动填入年龄
        $('input[name=age]').val(getAge(value));
        // 自动填入性别
        $('input[name=gender]').val(getGender(value));

        // 动态获取并填入就业失业登记证号
        $.get('/workRegisterId',
            {idNumber: value.toUpperCase()},
            function(data) {
                if (data == 'noRegister') {
                    data = '暂无'
                }
                $('input[name=workRegisterId]').val(data);
            });

    });

    // 校验毕业时间
    $('input[name=graduateDate]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validYear(value)) {
            if (confirm('毕业年份输入有误！')) {
                setTimeout(function() {
                    $('input[name=graduateDate]').focus();
                }, 10);
            }
        }
    });

    // 校验联系电话
    $('input[name=phone]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validPhone(value)) {
            if (confirm('联系电话输入有误！')) {
                setTimeout(function() {
                    $('input[name=phone]').focus();
                }, 10);
            }
        }
    });

    // 校验就业时间
    $('input[name=startWorkDate]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validDate(value)) {
            if (confirm('就业时间输入有误！')) {
                setTimeout(function() {
                    $('input[name=startWorkDate]').focus();
                }, 10);
            }
        }
    });

    // 校验年收入
    $('input[name=salary]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validSalary(value)) {
            if (confirm('年收入输入有误！')) {
                setTimeout(function() {
                    $('input[name=salary]').focus();
                }, 10);
            }
        }
    });

    // 校验失业时间
    $('input[name=unemployedDate]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validDate(value)) {
            if (confirm('就业时间输入有误！')) {
                setTimeout(function() {
                    $('input[name=unemployedDate]').focus();
                }, 10);
            }
        }
    });
    // 校验工资收入期望
    $('input[name=preferredSalary]').blur(function(e) {
        var value = e.target.value.trim();
        if (!validSalary(value)) {
            if (confirm('工资收入期望输入有误！')) {
                setTimeout(function() {
                    $('input[name=preferredSalary]').focus();
                }, 10);
            }
        }
    });

    // 控制“培训项目”表单栏的可用状态
    $('select[name=trainingType]').change(function() {
        var readOnly = ($('select[name=trainingType]').val() == '无');
        $('input[name=postTraining]').prop('readonly', readOnly);
    });

    // 控制“已就业信息”或“暂未就业信息”的显示
    var radios = $('input[name=employment]');
    radios.filter('[value=已就业]').focus(function() {
        $('#employment').css({display: 'block'});
        $('#unemployment').css({display: 'none'});
    });
    radios.filter('[value=暂未就业]').focus(function() {
        $('#employment').css({display: 'none'});
        $('#unemployment').css({display: 'block'});
    });
    if (radios.filter('[value=暂未就业]').prop('checked')) {
        $('#employment').css({display: 'none'});
        $('#unemployment').css({display: 'block'});
    } else {
        $('#employment').css({display: 'block'});
        $('#unemployment').css({display: 'none'});
    }

    // 控制“培训项目”表单栏的可用状态
    $('select[name=workplace]').change(function() {
        var readOnly = ($('select[name=workplace]').val() != '外省');
        $('select[name=workProvince]').prop('readonly', readOnly);
    });

    // 自动填入填报时间
    $('input[name=registerDate]').val(getDate())
});
