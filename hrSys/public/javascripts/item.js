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
    if (d.slice(4, 6) == 2 && d.slice(6) > 28) {
        return false;
    }
    return d.length == 8 && !isNaN(d) && 19000000 < d &&
        d.slice(0, 4) < 2100 && d.slice(4, 6) < 13 && d.slice(6) < 32;
}

// 检查收入数目的合法性
function validSalary(salary) {
    return !isNaN(salary);
}

// 由动态获取的数据设置页面DOM
function autoFill(data) {
    var dom;
    var msg = JSON.parse(data);
    if (msg.status == 'dbError') {
        if (confirm("系统访问故障，请稍后再试")) {
            setTimeout(function() {
                $('input[name=idNumber]').focus();
            }, 10);
        }
        return;
    }
    if (msg.status == 'permissionDeny') {
        if (confirm("该身份证号已在其他行政区登记，不能重复登记")) {
            setTimeout(function() {
                $('input[name=idNumber]').focus();
            }, 10);
        }
        return;
    }
    if (msg.name) {
        dom = $('input[name=username]');
        if (!$.trim(dom.val())) {
            dom.val(msg.name);
        }
    }
    // 设定户口性质，同时根据户口性质设置参保情况
    if (msg.hasOwnProperty('censusRegisterType')) {
        if (msg.hasOwnProperty('orgMedicalInsurance') ||
            msg.hasOwnProperty('orgRetireInsurance')) {
            msg.censusRegisterType = '非农业户口';
        }
        $('select[name=censusRegisterType]').val(msg.censusRegisterType);
        if (msg.censusRegisterType == '农业户口') {
            $('input[name=insurance2]').prop('checked', true);
            $('input[name=insurance7]').prop('checked', true);
        } else {
            $('input[name=insurance1]').prop('checked', true);
            $('input[name=insurance4]').prop('checked', true);
        }
    }
    if (msg.workRegisterId) {
        $('input[name=workRegisterId]').val(msg.workRegisterId);
        // 如果办理了就业失业登记证，也认为参加了失业保险
        //$('input[name=insurance5]').prop('checked', true);
    }
    if (msg.hasOwnProperty('unemployedInsurance')) {
        $('input[name=insurance5]').prop('checked', true);
    }
    if (msg.hasOwnProperty('workInjuryInsurance')) {
        $('input[name=insurance6]').prop('checked', true);
    }
    if (msg.hasOwnProperty('orgRetireInsurance')) {
        $('input[name=insurance0]').prop('checked', true);
        // 参加了城镇职工养老保险，则取消新农合及新农保
        $('input[name=insurance2]').prop('checked', false);
        $('input[name=insurance7]').prop('checked', false);
        // 同时取消城镇居民养老保险和城镇居民医疗保险
        $('input[name=insurance1]').prop('checked', false);
        $('input[name=insurance4]').prop('checked', false);
    }
    if (msg.hasOwnProperty('orgMedicalInsurance')) {
        $('input[name=insurance3]').prop('checked', true);
        // 参加了城镇职工医疗保险，则取消新农合及新农保
        $('input[name=insurance2]').prop('checked', false);
        $('input[name=insurance7]').prop('checked', false);
        // 同时取消城镇居民养老保险和城镇居民医疗保险
        $('input[name=insurance1]').prop('checked', false);
        $('input[name=insurance4]').prop('checked', false);
    }
    if (msg.hasOwnProperty('workRecommend')) {
        $('input[name=postService0]').prop('checked', true);
    }
    if (msg.hasOwnProperty('vocationalTraining')) {
        $('select[name=trainingType]').val('职业培训');
        $('input[name=postTraining]')
            .removeAttr('readonly')
            .val(msg.vocationalTraining);
        $('input[name=postService1]').prop('checked', true);
    }
    if (msg.hasOwnProperty('startupTraining')) {
        $('select[name=trainingType]').val('创业培训');
        $('input[name=postTraining]')
            .removeAttr('readonly')
            .val(msg.startupTraining);
        $('input[name=postService1]').prop('checked', true);
    }
    if (msg.technicalGrade) {
        dom = $('select[name=technicalGrade]');
        if (msg.technicalGrade == '初级') {
            dom.val('初级技工');
        } else if (msg.technicalGrade == '中级') {
            dom.val('中级技工');
        } else if (msg.technicalGrade == '高级') {
            dom.val('高级技工');
        }
        // 设定为享受职业技能鉴定服务
        $('input[name=postService2]').prop('checked', true);
    }
    if (msg.hasOwnProperty('socialSubsidy')) {
        $('input[name=postService3]').prop('checked', true);
    }
    if (msg.hasOwnProperty('publicWelfare')) {
        $('input[name=postService4]').prop('checked', true);
    }
    if (msg.hasOwnProperty('securedLoan')) {
        $('input[name=postService5]').prop('checked', true);
    }
    if (msg.hasOwnProperty('internship')) {
        $('input[name=postService6]').prop('checked', true);
    }
}

// 页面装载完成后执行
$(function() {
    // 校验身份证号，自动填入姓名、年龄、性别等等
    $('input[name=idNumber]').blur(function(e) {
        var value = $.trim(e.target.value);
        // 校验身份证号
        if (!validIdNumber(value)) {
            if (confirm("身份证号码输入有误，需重新输入！")) {
                setTimeout(function() {
                    $('input[name=idNumber]').focus();
                }, 10);
            }
            return;
        }
        // 如果身份证末尾为'x'，改为大写字母
        $('input[name=idNumber]').val(value.toUpperCase());
        // 自动填入年龄
        var age = getAge(value);
        $('input[name=age]').val(age);
        // 自动填入性别
        var gender = getGender(value);
        $('input[name=gender]').val(gender);
        // 如果是小于25岁男性或小于23岁女性，婚姻状况默认设为未婚
        if (age < 25 && gender == '男' || age < 23 && gender == '女') {
            $('select[name=marriage]').val('未婚');
        }

        // 动态获取并填入姓名、就业失业登记证号、劳动技能信息、已享受就业服务等信息
        $.get('/data/existMsg', {idNumber: value.toUpperCase()}, autoFill);
        /*$.get('/data/workRegisterId',
            {idNumber: value.toUpperCase()},
            function(data) {
                if (data == 'noRegister') {
                    data = '暂无'
                }
                $('input[name=workRegisterId]').val(data);
            });*/
    });

    // 就业失业登记证号必须是长度为16个字符，且为数字
    $('input[name=workRegisterId]').blur(function() {
        var value = $(this).val();
        if (value && (value.length != 16 || isNaN(value))) {
            if (confirm("就业失业登记证号码输入有误，需重新输入！")) {
                setTimeout(function() {
                    $('input[name=workRegisterId]').focus();
                }, 10);
            }
        }
    });

    // 当管辖区域较大的用户登录时，行政区划代码需要手工输入，
    // 再由此代码获取地址信息，并设置户口性质的默认值，以及设置参保情况
    var  districtId = $('input[name=districtId]');
    if (!districtId.prop('readonly')) {
        districtId.blur(function() {
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
                    // 设置地址信息
                    $('input[name=address]').val(data);
                    // 设置户口性质及参保情况
                    // 如果城镇职工养老保险或城镇职工医疗保险未勾选，
                    // 且对应行政区以“村”结尾则默认为农业户口
                    var orgMedicalInsurance =
                        $('input[name=insurance0]').prop('checked');
                    var orgRetireInsurance =
                        $('input[name=insurance3]').prop('checked');
                    if (!orgMedicalInsurance && !orgRetireInsurance &&
                        data.slice(-1) == '村') {
                        // 农业户口
                        $('select[name=censusRegisterType]').val('农业户口');
                        // 选中新农保和新农合
                        $('input[name=insurance2]').prop('checked', true);
                        $('input[name=insurance7]').prop('checked', true);
                        $('input[name=insurance1]').prop('checked', false);
                        $('input[name=insurance4]').prop('checked', false);
                    } else {
                        // 非农业户口情况
                        $('select[name=censusRegisterType]').val('非农业户口');
                        $('input[name=insurance2]').prop('checked', false);
                        $('input[name=insurance7]').prop('checked', false);
                        $('input[name=insurance1]').prop('checked', true);
                        $('input[name=insurance4]').prop('checked', true);
                    }
                }
            });
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

    // 默认学历为初中
    $('select[name=education]').val('初中');

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

    // 根据户口性质调整参保的默认情况
    $('select[name=censusRegisterType]').change(function() {
        if ($('select[name=censusRegisterType]').val() == '农业户口') {
            // 选中新农保和新农合，取消城镇居民医保和养老保险
            $('input[name=insurance2]').prop('checked', true);
            $('input[name=insurance7]').prop('checked', true);
            $('input[name=insurance1]').prop('checked', false);
            $('input[name=insurance4]').prop('checked', false);
            // 取消城镇职工养老保险和职工医疗保险
            $('input[name=insurance0]').prop('checked', false);
            $('input[name=insurance3]').prop('checked', false);
        } else {
            // 取消新农保和新农合，选中城镇居民医保和养老保险
            $('input[name=insurance2]').prop('checked', false);
            $('input[name=insurance7]').prop('checked', false);
            $('input[name=insurance1]').prop('checked', true);
            $('input[name=insurance4]').prop('checked', true);
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

    // 默认情况下将主要从事工种或就业工种意向设置为空值
    $('select[name^=jobType]').val('');

    // 校验年收入
    $('input[name=salary]').blur(function(e) {
        var value = $.trim(e.target.value);
        if (!validSalary(value)) {
            if (confirm('年收入输入有误！')) {
                setTimeout(function() {
                    $('input[name=salary]').focus();
                }, 10);
            }
        } else if (value > 100) {   // 限定年收入不超过100万元，以避免输入错误
            if (confirm('注意以万元为单位，可以有小数，但不得超过100（万元）')) {
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
            if (confirm('失业时间输入有误！')) {
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
        } else if (value > 100) {   // 限定年收入期望不超过100万元，以避免输入错误
            if (confirm('注意以万元为单位，可以有小数，但不得超过100（万元）')) {
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

    // 默认情况下将外出省份设置为空值
    var workProvince = $('select[name=workProvince]');
    workProvince.val('');
    var workplace = $('select[name=workplace]');
    workplace.val('');
    //if (workplace.val() == '外省') {
    //    workProvince.removeAttr('disabled');
    //}
    // 控制“外出省份”表单栏的可用状态
    workplace.change(function(e) {
        //$('select[name=workProvince]').prop('disabled', true);
        if ($(e.target).val() != '外省') {
            $('select[name=workProvince]').attr('disabled', 'disabled');
        } else {
            $('select[name=workProvince]').removeAttr('disabled');
        }
    });

    // 默认情况下从事产业或就业产业意向设置为空值
    $('select[name$=ndustry]').val('');
    // 默认情况下就业形式设置为空值
    $('select[name$=obForm]').val('');
    // 默认情况下就业形式设置为空值
    $('select[name=preferredWorkplace]').val('');

    // 自动填入填报时间
    $('input[name=registerDate]').val(getDate());

    // 提交前进行栏目的校验
    $('button[type=submit]').click(function() {
        var err = $('#errorMessage');
        if ($.trim($('input[name=username]').val()) == '') {
            err.text('请输入姓名！');
            setTimeout(function() {$('input[name=username]').focus();}, 600);
            return false;
        }
        // 校验身份证号
        var idNumber = $('input[name=idNumber]');
        if (!validIdNumber($.trim(idNumber.val()))) {
            err.text('身份证号无效，请重新输入！');
            setTimeout(function() {idNumber.focus();}, 600);
            return false;
        }
        // 校验就业失业登记证号
        var workRegisterId = $('input[name=workRegisterId]');
        var value = $.trim(workRegisterId.val());
        if (value && (value.length != 16 || isNaN(value))) {
            err.text('就业失业登记证号无效，请重新输入！');
            setTimeout(function() {workRegisterId.focus();}, 600);
            return false;
        }
        // 校验行政区划代码是否已输入
        var districtId = $('input[name=districtId]');
        if (!$.trim(districtId.val())) {
            err.text('请输入行政区划代码');
            setTimeout(function() {districtId.focus();}, 600);
            return false;
        }
        // 校验地址信息，用于乡镇或以上级别用户
        if ($('input[name=address]').val() == '不在管辖范围内') {
            err.text('行政区划代码输入有误，请重新输入！');
            setTimeout(function() {$('input[name=districtId]').focus();}, 600);
            return false;
        }
        // 校验毕业时间
        /*
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
        */
        // 校验联系电话
        var phone = $('input[name=phone]');
        if (!validPhone($.trim(phone.val()))) {
            err.text('联系电话输入有误，请重新输入！');
            setTimeout(function() {phone.focus();}, 600);
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
            err.text('失业时间输入有误，请按照yyyymmdd的格式重新输入！');
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
        // 已就业则必须填入就业单位及就业时间
        if (radios.filter('[value=已就业]').prop('checked')) {
            // 校验就业单位
            var employer = $('input[name=employer]');
            if (!$.trim(employer.val())) {
                err.text('请输入就业单位！');
                setTimeout(function() {employer.focus();}, 600);
                return false;
            }
            // 主要从事工种不能为空
            if (!$('select[name=jobType]').val()) {
                err.text('请选择主要从事工种！');
                return false;
            }
            // 从事产业类型不能为空
            if (!$('select[name=industry]').val()) {
                err.text('请选择从事产业类型！');
                return false;
            }
            // 校验就业时间
            var startWorkDate = $('input[name=startWorkDate]');
            var dateValue = $.trim(startWorkDate.val());
            if (!dateValue) {
                err.text('请输入就业时间！');
                setTimeout(function() {startWorkDate.focus();}, 600);
                return false;
            }
            if (!validDate(dateValue)) {
                err.text('就业时间输入有误，请按yyyymmdd的格式重新输入！');
                setTimeout(function() {startWorkDate.focus();}, 600);
                return false;
            }
            // 就业地点不能为空
            var workplace = $('select[name=workplace]').val();
            if (!workplace) {
                err.text('请选择就业地点！');
                return false;
            }
            if (workplace == '外省' && !$('select[name=workProvince]').val()) {
                err.text('请选择外出就业省份！');
                return false;
            }
            // 就业形式不能为空
            if (!$('select[name=jobForm]').val()) {
                err.text('请选择就业形式 ！');
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
