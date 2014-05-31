$('#submit').click(function() {
    var username = $('input[name=username]').val().trim();
    var password = $('input[name=password]').val().trim();
    var retryPassword = $('input[name=retryPassword]').val().trim();
    var msgDom = $('#message');
    if (!username || !password) {
        msgDom.text('账号名和密码不能为空，请重新输入！');
        return;
    }
    if (password != retryPassword) {
        msgDom.text('两次输入的密码不一致，请重新输入！');
        return;
    }
    $.post('/resetPassword', {
        username: username,
        password: password,
        retryPassword: retryPassword
    }, function(data) {
        if (data == 'ok') {
            msgDom.text('密码修改成功！')
                .css({color: 'green'});
        } else if (data == 'errPassword') {
            msgDom.text('密码设置有误，密码未被修改！')
                .css({color: 'red'});
        } else if (data == 'errPermission') {
            msgDom.text('您无权修改此用户的密码！')
                .css({color: 'red'});
        } else {
            msgDom.text('无法修改该用户的密码！')
                .css({color: 'red'});
        }
    });
});