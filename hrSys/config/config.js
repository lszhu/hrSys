// 此处修改内置管理员账号的名称和密码等信息
var builtinAccount = {
    username: 'admin',          // 管理员名称
    password: 'admin',            // 管理员密码
    area: '0',
    permission: '管理员',
    type: 'independent'
};

// 此处设定mongodb数据库服务器的参数：链接地址、端口、数据库
var dbServer = {
    address: 'localhost:',
    port: '27017',
    dbName: 'hrsys'
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'hrsys',           // 数据库连接用户名称
    pass: 'letmein',         // 数据库连接用户密码
    server: {socketOptions: {keepAlive: 1}}
};

module.exports = {
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    }
};