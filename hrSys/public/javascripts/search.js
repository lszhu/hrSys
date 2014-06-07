$('button').click(function() {
    var condition = {};

    condition.username = $('input[name=username]').val().trim();
    condition.ageMin = $('input[name=ageMin]').val().trim();
    condition.ageMax = $('input[name=ageMax]').val().trim();
    var sel = ['gender', 'nation', "districtId", 'censusRegisterType',
        'education', 'employment', 'workplace', 'jobType'];
    var tmp = '';
    for (var i = 0; i < sel.length; i++) {
        tmp = 'select[name=' + sel[i] + ']';
        condition[sel[i]] = $(tmp).val();
    }
    $.post('/search',{condition: condition}, function(data) {
        $('#searchResult').html(data);
    });
});