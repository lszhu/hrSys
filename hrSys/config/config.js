// 此处设置web服务的端口号
//var httpPort = 88;         // 蓝山所用端口号
var httpPort = 13188;      // 宁远所用端口号

// 此处设置web服务使用环境，可以是开发环境或生产环境
//var runningEnv = 'development';
var runningEnvironment = 'productivity';

// 此处设置系统读取的静态数据
// 'lanShan' 表示蓝山县
// 'ningYuan' 表示宁远县
// 'xinTian' 表示新田县
var county =  'ningYuan';
//var county = 'lanShan';

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
    dbName: 'ningyuan'        // 宁远县数据库名称
//    dbName: 'xintian'         // 新田县数据库名称
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'hrsys',           // 数据库连接用户名称
    pass: 'letmein',         // 数据库连接用户密码
    server: {socketOptions: {keepAlive: 1}}
};

module.exports = {
    port: httpPort,
    runningEnv: runningEnvironment,
    county: county,
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    }
};