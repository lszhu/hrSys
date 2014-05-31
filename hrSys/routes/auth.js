var builtinAccount = require('../config/config').builtinAccount;
/* builtin account
var builtinAccount = {
    username: 'admin',
    password: 'admin',
    area: '0',
    permission: '管理员',
    type: 'independent'
};
*/

function auth(acc, stdAcc) {
    if (stdAcc) {
        return acc && stdAcc.enabled &&
            acc.username == stdAcc.username &&
            acc.password == stdAcc.password;
    }
    return acc && acc.username == builtinAccount.username &&
        acc.password == builtinAccount.password;
}

module.exports = {
    auth: auth,
    builtinUser: builtinAccount.username
};