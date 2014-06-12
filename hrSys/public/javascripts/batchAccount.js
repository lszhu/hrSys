$('#initAccount').click(function() {
    $.post('/batchAccount', {command: 'initAccount'}, function(data) {
        if (data == 'ok') {
            $('<p>账号初始化成功</p>')
                .css({color: 'green'})
                .appendTo('#initAccountMsg');
        } else {
            $('<p>无法执行账号初始化，请先用管理员账号登录</p>')
                .css({color: 'red'})
                .appendTo('#initAccountMsg');
        }
    });
});

$('#initPassword').find('button').click(function() {
    var dom =  $('#initPassword');
    var password = $.trim(dom.find('input[name=password]').val());
    var retryPassword = $.trim(dom.find('input[name=retryPassword]').val());
    if (!password) {
        $('<p>密码不能为空，请重新设定</p>')
            .css({color: 'red'})
            .appendTo('#initPasswordMsg');
        return;
    }
    if (password != retryPassword) {
        $('<p>两次输入的密码不一致，请重新输入</p>')
            .css({color: 'red'})
            .appendTo('#initPasswordMsg');
        return;
    }
    $.post('/batchAccount',
        {command: 'initPassword', password: password},
        function(data) {
            if (data == 'ok') {
                $('<p>密码初始化成功</p>')
                    .css({color: 'green'})
                    .appendTo('#initPasswordMsg');
            } else {
                $('<p>无法执行密码初始化，请先用管理员账号登录</p>')
                    .css({color: 'red'})
                    .appendTo('#initPasswordMsg');
            }
        });
});

$('#changePermission').find('button').click(function() {
    var right = $('#changePermission').find('select').val();
    $.post('/batchAccount',
        {command: 'changePermission', permission: right},
        function(data) {
            if (data == 'ok') {
                $('<p>权限更改成功</p>')
                    .css({color: 'green'})
                    .appendTo('#changePermissionMsg');
            } else {
                $('<p>无法执行权限更改，请先用管理员账号登录</p>')
                    .css({color: 'red'})
                    .appendTo('#changePermissionMsg');
            }
        });
});

$('#changeStatus').find('button').click(function() {
    var status = ($('#changeStatus').find('select').val() == '可用');

    $.post('/batchAccount',
        {command: 'changeStatus', status: status},
        function(data) {
            if (data == 'ok') {
                $('<p>账号状态更改成功</p>')
                    .css({color: 'green'})
                    .appendTo('#changeStatusMsg');
            } else {
                $('<p>无法执行账号状态更改，请先用管理员账号登录</p>')
                    .css({color: 'red'})
                    .appendTo('#changeStatusMsg');
            }
        });
});