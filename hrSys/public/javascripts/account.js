$('button').click(function() {
    var user = $(this).parent().parent().children('.account').text();
    var dom = $(this);
    var textContent = $(this).text();
    if (textContent == '启 用') {
        $.get('/updateAccount', {op: 'disable', user: user}, function(data) {
            if (data != 'ok') {
                return;
            }
            dom.text('禁 用');
            dom.removeClass('btn-success');
            dom.addClass('btn-warning');
        });
    }
    if (textContent == '禁 用') {
        $.get('/updateAccount', {op: 'enable', user: user}, function(data) {
            if (data != 'ok') {
                return;
            }
            dom.text('启 用');
            dom.removeClass('btn-warning');
            dom.addClass('btn-success');
        });
    }
    if (textContent == '删 除') {
        $.get('/updateAccount', {op: 'remove', user: user}, function(data) {
            if (data != 'ok') {
                return;
            }
            dom.parents('tr').empty();
        });
    }
    if (textContent == '重 置') {
        location.pathname = '/resetPassword';
    }

    //console.log('user: ' + user);
});