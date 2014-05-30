
// temp accounts
var accounts = [
    {username: 'default', password: 'default'},
    {username: 'admin', password: 'admin'},
    {username: 'jason', password: 'letmein'},
    {username: 'jerry', password: 'letmein'}
];

// builtin account
var builtinAccount = {
    username: 'admin',
    password: 'admin',
    area: '不限',
    permission: '不限',
    type: 'independent'
};
function auth(acc, stdAcc) {
    if (stdAcc && stdAcc.enabled &&
        acc.username == stdAcc.username &&
        acc.password == stdAcc.password ) {
        return true;
    }
    return acc.username == builtinAccount.username &&
        acc.password == builtinAccount.password;
}

module.exports = {
    auth: auth,
    builtinUser: builtinAccount.username
};
