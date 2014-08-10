$('button')
    .click(function() {
        var districtId = '/export?districtId=';
        districtId += $('select[name=districtId]').val();
        var host = location.host;
        location.href = 'http://' + host + districtId;
        $('button').prop('disabled', true);
    })
    .prop('disabled', true);

$('select')
    .change(function() {
        $('button').prop('disabled', false);
    })
    .val('');
