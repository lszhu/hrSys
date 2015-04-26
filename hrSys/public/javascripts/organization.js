// 校验组织机构代码的合法性，代码共9位，最后一位是校验码
function validCode(code) {
    if (!code || code.length !== 9) {
        return false;
    }
    code = code.toString().toUpperCase();
    var alphaNum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var weight = [3, 7, 9, 10, 5, 8, 4, 2];
    var sum = 0;
    var n;
    for (var i = 0; i < 8; i++) {
        n = alphaNum.search(code[i]);
        if (n == -1) {
            return false;
        }
        sum += n * weight[i];
    }
    sum = 11 - sum % 11;
    if (sum == 10) {
        sum = 'X';
    } else if (sum == 11) {
        sum = '0';
    }
    return sum == code[8];
}

// 返回日期，格式：年-月-日
function getDate() {
    var t = new Date();
    var y = t.getFullYear();
    var m = t.getMonth() + 1;
    var d = t.getDate();
    var date =  y + '年 ' + m + '月 ' + d + '日';
    //console.log('date: ' + date);
    return date;
}

// 检查电话的合法性
function validPhone(phone) {
    return !phone ||
        !isNaN(phone) && 6 < phone.length && phone.length < 13;
}

// 页面装载完成后执行
$(function() {
    // 校验组织机构代码
    $('input[name=orgCode]').blur(function(e) {
        var value = $.trim(e.target.value);
        if (value.length == 10) {
            value = value.split('');
            value.splice(-2, 1);
            value = value.join('');
            $('input[name=orgCode]').val(value);
        }
        // 校验组织机构代码
        if (!validCode(value)) {
            if (confirm("组织机构代码输入有误，需重新输入！")) {
                setTimeout(function() {
                    $('input[name=orgCode]').focus();
                }, 10);
            }
        }
    });

    // 当管辖区域较大的用户登录时，行政区划代码需要手工输入，
    var  districtId = $('input[name=districtId]');
    if (!districtId.prop('readonly')) {
        districtId.blur(function () {
            $.get('/data/address',
                {districtId: $.trim(districtId.val())},
                function (data) {
                    if (data == 'districtIdError' || data == 'permissionError') {
                        //$('input[name=address]').val('不在管辖范围内');
                        if (confirm('行政区划代码输入有误！')) {
                            setTimeout(function () {
                                $('input[name=districtId]').focus();
                            }, 10);
                        }
                    } else if (data == 'emptyDistrictId') {
                        $('input[name=address]').val('');
                        if (confirm('请输入行政区划代码！')) {
                            setTimeout(function () {
                                $('input[name=districtId]').focus();
                            }, 10);
                        }
                    } else {
                        $('input[name=districtStatus]').val('ok');
                    }
                }
            )
        });
    }

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

    // 默认情况下单位类型设置为空值
    $('select[name=orgType]').val('');
    // 默认情况下经济类型设置为空值
    $('select[name=economicType]').val('');
    // 默认情况下从事产业或就业产业意向设置为空值
    $('select[name=industry]').val('');
    // 默认情况下就业形式设置为空值
    $('select[name=jobForm]').val('');

    // 自动填入填报时间
    $('input[name=registerDate]').val(getDate());

    // 提交前进行栏目的校验
    $('button[type=submit]').click(function() {
        var err = $('#errorMessage');
        if ($.trim($('input[name=orgName]').val()) == '') {
            err.text('请输入单位名称！');
            setTimeout(function() {$('input[name=orgName]').focus();}, 600);
            return false;
        }
        // 校验组织机构代码
        var orgCode= $('input[name=orgCode]');
        if (!validCode($.trim(orgCode.val()))) {
            err.text('组织机构代码无效，请重新输入！');
            setTimeout(function() {orgCode.focus();}, 600);
            return false;
        }

        // 校验行政区划代码是否已正确输入（通过隐藏的districtStatus确定）
        var districtStatus = $('input[name=districtStatus]');
        if (districtStatus.val() != 'ok') {
            err.text('请正确输入行政区划代码');
            setTimeout(function() {districtId.focus();}, 600);
            return false;
        }

        // 校验联系电话
        var phone = $('input[name=phone]');
        if (!validPhone($.trim(phone.val()))) {
            err.text('联系电话输入有误，请重新输入！');
            setTimeout(function() {phone.focus();}, 600);
            return false;
        }

        // 单位联系地址不能为空
        if (!$('input[name=address]').val()) {
            err.text('请输入单位联系地址！');
            return false;
        }

        // 单位类型不能为空
        if (!$('select[name=orgType]').val()) {
            err.text('请选择单位类型！');
            return false;
        }
        // 经济类型不能为空
        if (!$('select[name=economicType]').val()) {
            err.text('请选择经济类型！');
            return false;
        }

        // 所属行业不能为空
        if (!$('select[name=jobForm]').val()) {
            err.text('请选择所属行业 ！');
            return false;
        }
        // 产业类型不能为空
        if (!$('select[name=industry]').val()) {
            err.text('请选择产业类型 ！');
            return false;
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
