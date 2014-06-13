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
        if (isNaN(Number(digit))) {
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
    return !phone ||
        !isNaN(phone) && 6 < phone.length && phone.length < 13;
}

// 检查年月日的合法性，格式为：YYYYMMDD
function validDate(d) {
    if (!d) {
        return true;
    }
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
        var value = $.trim(e.target.value);
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
        $.get('/data/workRegisterId',
            {idNumber: value.toUpperCase()},
            function(data) {
                if (data == 'noRegister') {
                    data = '暂无'
                }
                $('input[name=workRegisterId]').val(data);
            });
    });

    // 当管辖区域较大的用户登录时，行政区划代码需要手工输入，再由此代码获取地址信息
    var  districtId = $('input[name=districtId]');
    if (!districtId.prop('readonly')) {
        districtId.blur(function(e) {
            $.get('/data/address',
                {districtId: $.trim(districtId.val())},
            function(data) {
                if (data == 'districtIdError' || data == 'permissionError') {
                    $('input[name=address]').val('不在管辖范围内');
                    if (confirm('行政区划代码输入有误！')) {
                        setTimeout(function() {
                            $('input[name=districtId]').focus();
                        }, 10);
                    }
                } else if (data == 'emptyDistrictId') {
                    $('input[name=address]').val('');
                    if (confirm('请输入行政区划代码！')) {
                        setTimeout(function() {
                            $('input[name=districtId]').focus();
                        }, 10);
                    }
                } else {
                    $('input[name=address]').val(data);
                }
            })
        });
    }

    // 校验毕业时间
    $('input[name=graduateDate]').blur(function(e) {
        var value = $.trim(e.target.value);
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
        var value = $.trim(e.target.value);
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
        var value = $.trim(e.target.value);
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
        var value = $.trim(e.target.value);
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
        var value = $.trim(e.target.value);
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
        var value = $.trim(e.target.value);
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

    // 控制“外出省份”表单栏的可用状态
    var workplace = $('select[name=workplace]');
    if (workplace.val() == '外省') {
        $('select[name=workProvince]').removeAttr('disabled');
    }
    workplace.change(function(e) {
        //$('select[name=workProvince]').prop('disabled', true);
        if ($(e.target).val() != '外省') {
            $('select[name=workProvince]').attr('disabled', 'disabled');
        } else {
            $('select[name=workProvince]').removeAttr('disabled');
        }
    });

    // 自动填入填报时间
    $('input[name=registerDate]').val(getDate());

    // 提交前进行栏目的校验
    $('button[type=submit]').click(function() {
        var err = $('#errorMessage');
        // 校验身份证号
        var idNumber = $('input[name=idNumber]');
        if (!validIdNumber($.trim(idNumber.val()))) {
            err.text('身份证号无效，请重新输入！');
            setTimeout(function() {idNumber.focus();}, 600);
            return false;
        }
        // 校验地址信息，用于乡镇或以上级别用户
        if ($('input[name=address]').val() == '不在管辖范围内') {
            err.text('行政区划代码输入有误，请重新输入！');
            setTimeout(function() {$('input[name=districtId]').focus();}, 600);
            return false;
        }
        // 校验毕业时间
        var graduateDate = $('input[name=graduateDate]');
        var edu = $('select[name=education]').val();
        if (edu == '中专中技' || edu == '大专' || edu == '本科及以上') {
            if (!$.trim(graduateDate.val())) {
                err.text('请输入毕业年份！');
                setTimeout(function() {graduateDate.focus();}, 600);
                return false;
            }
            if (!validYear($.trim(graduateDate.val()))) {
                err.text('毕业年份输入有误，请重新输入！');
                setTimeout(function() {graduateDate.focus();}, 600);
                return false;
            }
        }
        // 校验联系电话
        var phone = $('input[name=phone]');
        if (!validPhone($.trim(phone.val()))) {
            err.text('联系电话输入有误，请重新输入！');
            setTimeout(function() {phone.focus();}, 600);
            return false;
        }
        // 校验就业时间
        var startWorkDate = $('input[name=startWorkDate]');
        if (!validDate($.trim(startWorkDate.val()))) {
            err.text('就业时间输入有误，请重新输入！');
            setTimeout(function() {startWorkDate.focus();}, 600);
            return false;
        }
        // 校验年收入
        var salary = $('input[name=salary]');
        if (!validSalary($.trim(salary.val()))) {
            err.text('年收入输入有误，请重新输入！');
            setTimeout(function() {salary.focus();}, 600);
            return false;
        }
        // 校验失业时间
        var unemployedDate = $('input[name=unemployedDate]');
        if (!validDate($.trim(unemployedDate.val()))) {
            err.text('失业时间输入有误，请重新输入！');
            setTimeout(function() {unemployedDate.focus();}, 600);
            return false;
        }
        // 校验工资收入期望
        var preferredSalary = $('input[name=preferredSalary]');
        if (!validSalary($.trim(preferredSalary.val()))) {
            err.text('工资收入期望输入有误，请重新输入！');
            setTimeout(function() {preferredSalary.focus();}, 600);
            return false;
        }
        var radios = $('input[name=employment]');
        // 已就业则必须填入就业单位
        if (radios.filter('[value=已就业]').prop('checked')) {
            var employer = $('input[name=employer]');
            if (!$.trim(employer.val())) {
                err.text('请输入就业单位！');
                setTimeout(function() {employer.focus();}, 600);
                return false;
            }
        } else {        // 未就业则必须填入工资收入期望
            if(!$.trim(preferredSalary.val())) {
                err.text('请输入工资收入期望！');
                setTimeout(function() {preferredSalary.focus();}, 600);
                return false;
            }
        }
        var editor = $('input[name=editor]');
        if (!$.trim(editor.val())) {
            err.text('请输入填报人！');
            setTimeout(function() {editor.focus();}, 600);
            return false;
        }
    });
    $('input[type=text]').blur(function() {
        $('#errorMessage').text('');
    });
});
