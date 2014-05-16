
// temp accounts
var accounts = [
    {username: 'default', password: 'default'},
    {username: 'admin', password: 'admin'},
    {username: 'jason', password: 'letmein'},
    {username: 'jerry', password: 'letmein'}
];

exports.auth = function(acc) {
    for (var i = 0; i < accounts.length; i++) {
        if (acc.username == accounts[i].username &&
            acc.password == accounts[i].password) {
            return true;
        }
    }
    return false;
};
