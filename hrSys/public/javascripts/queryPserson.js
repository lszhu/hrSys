$('button').click(function() {
    var username = $('input[name=username]').val().trim();
    var idNumber = $('input[name=idNumber]').val().trim();
    if (!username || !idNumber) {
        alert('姓名和身份证号都必须填写');
        return;
    }
    if (!confirm('确认要删除该人员信息？')) {
        return;
    }
    $.post('/delete', {
            condition: {
                username: username,
                idNumber: idNumber
            }
        },
        function(data) {
            if (data == 'ok') {
                $('#message').text('成功删除该人员信息！');
            }
        });
});