// 验证身份证号的合法性
function ckIdNumber(idNumber) {
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
    if (!ckIdNumber(idNumber)) {
        return '';
    }
    var now = (new Date()).getFullYear();
    var year = idNumber.slice(6, 10);
    return now - year;
}

// 由身份证号得到性别
function getGender(idNumber) {
    if (!ckIdNumber(idNumber)) {
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

// 页面装载完成后执行
$(function() {
    // 校验身份证号，自动填入年龄性别
    $('input[name=idNumber]').blur(function(e) {
        var value = e.target.value.trim();
        // 校验身份证号
        if (!ckIdNumber(value)) {
            if (confirm("身份证号码输入有误！")) {
                setTimeout(function() {
                    $('input[name=idNumber]').focus();
                }, 10);
            }
        }
        // 自动填入年龄
        $('input[name=age]').val(getAge(value));
        // 自动填入性别
        $('input[name=gender]').val(getGender(value));
    });

    // 控制“培训项目”表单栏的可用状态
    $('select[name=trainingType]').change(function() {
        var disabled = ($('select[name=trainingType]').val() == '无');
        $('input[name=postTraining]').prop('disabled', disabled);
    });

    // 控制“已就业信息”或“暂未就业信息”的显示
    var radios = $('input[name=employment]');
    radios.filter('[value=已就业信息]').focus(function() {
        $('#employment').css({display: 'block'});
        $('#unemployment').css({display: 'none'});
    });
    radios.filter('[value=暂未就业信息]').focus(function() {
        $('#employment').css({display: 'none'});
        $('#unemployment').css({display: 'block'});
    });

    // 控制“培训项目”表单栏的可用状态
    $('select[name=workplace]').change(function() {
        var disabled = ($('select[name=workplace]').val() != '外省');
        $('select[name=workProvince]').prop('disabled', disabled);
    });

    // 自动填入填报时间
    $('input[name=registerDate]').val(getDate())
});
