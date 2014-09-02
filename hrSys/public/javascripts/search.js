var sel = ['gender', 'nation', "districtId", 'censusRegisterType',
    'education', 'employment', 'workplace', 'jobType'];

$('button.query').click(function() {
    var condition = {};

    condition.username = $.trim($('input[name=username]').val());
    condition.ageMin = $.trim($('input[name=ageMin]').val());
    condition.ageMax = $.trim($('input[name=ageMax]').val());

    var tmp = '';
    for (var i = 0; i < sel.length; i++) {
        tmp = 'select[name=' + sel[i] + ']';
        condition[sel[i]] = $(tmp).val();
    }
    $.post('/search', {condition: condition}, function(data) {
        $('#searchResult').html(data.html);
        $('#count').html('（检索到' + data.count + '条记录）');
    });
});

$('button.export').click(function() {
    var query = '/download?';
        query += 'username=' +
            $.trim($('input[name=username]').val());
        query += '&ageMin=' +
            $.trim($('input[name=ageMin]').val());
        query += '&ageMax=' + $.trim($('input[name=ageMax]').val());
    var tmp = '';
    for (var i = 0; i < sel.length; i++) {
        tmp = 'select[name=' + sel[i] + ']';
        query += '&' + [sel[i]] + '=' + $.trim($(tmp).val());
    }
    var host = location.host;
    location.href = 'http://' + host + query;
});