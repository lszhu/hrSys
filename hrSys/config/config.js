/*
 至少请修改三个参数：
 1. web服务端口号httpPort
 2. 静态数据目录（为对应区县拼音）county
 3. 数据库名称（对应区县拼音，除蓝山为hrsys外）dbServer.dbName
 */
// 此处设置web服务的端口号
//var httpPort = 88;         // 蓝山所用端口号
//var httpPort = 13188;      // 宁远所用端口号
// var httpPort = 13288;     // 新田所用端口号
var httpPort = 13388;      // 冷水滩所用端口号

// 此处设置web服务使用环境，可以是开发环境或生产环境
//var runningEnvironment = 'development';
var runningEnvironment = 'productivity';

// 此处设置系统读取的静态数据
// 'lanShan' 表示蓝山县
// 'ningYuan' 表示宁远县
// 'xinTian' 表示新田县
//var county =  'ningYuan';
//var county = 'lanShan';
//var county = 'xinTian';
var county = 'lengShuiTan';

// 此处修改内置管理员账号的名称和密码等信息
var builtinAccount = {
    username: 'admin',            // 管理员名称
    password: 'admin',            // 管理员密码
    area: '0',
    permission: '管理员',
    type: 'independent'
};

// 此处设定mongodb数据库服务器的参数：链接地址、端口、数据库
var dbServer = {
    address: 'localhost:',
    port: '27017',
//    dbName: 'hrsys'           // 蓝山县数据库名称
//    dbName: 'ningyuan'        // 宁远县数据库名称
//    dbName: 'xintian'         // 新田县数据库名称
    dbName: 'lengshuitan'     // 冷水滩数据库名称
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'hrsys',           // 数据库连接用户名称
    pass: 'letmein',         // 数据库连接用户密码
    server: {socketOptions: {keepAlive: 1}}
};

// 对查询数据库结果数目作出限制，以保证系统性能，避免假死
var queryLimit = 50000;

module.exports = {
    port: httpPort,
    runningEnv: runningEnvironment,
    county: county,
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    },
    queryLimit: queryLimit
};