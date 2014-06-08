$('button').click(function() {
    var districtId = '/export?districtId=';
    districtId += $('select[name=districtId]').val();
    location.pathname = districtId;
});