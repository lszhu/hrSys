var nations = [
    "汉族","蒙古族","回族","藏族","维吾尔族","苗族","彝族","壮族",
    "布依族","朝鲜族","满族","侗族","瑶族","白族","土家族","哈尼族",
    "哈萨克族","傣族","黎族","傈傈族","佤族","畲族","高山族","拉祜族",
    "水族","东乡族","纳西族","景颇族","柯尔克孜族","土族","达翰尔族",
    "仫佬族","羌族","布朗族","撒拉族","毛南族","仡佬族","锡伯族",
    "阿昌族","普米族","塔吉克族","怒族","乌孜别克族","俄罗斯族",
    "鄂温克族","德昂族","保安族","裕固族","京族","塔塔尔族","独龙族",
    "鄂伦春族","赫哲族","门巴族","珞巴族","基诺族","外籍人士"
];
// province
var provinces = [
    '湖南省', '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '甘肃省',
    '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省',
    '福建省', '江西省', '山东省', '河南省', '湖北省', '广东省', '广西壮族自治区',
    '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省',
    '青海省', '宁夏回族自治区', '新疆维吾尔自治区'];

var politicalOutlook = [
    '中共党员',
    '群众',
    '团员',
    '民主人士',
    '其他'
];

// 是否已经就业
var employment = [
    '已就业',
    '暂未就业'
];

// 文化程度：
var education = [
    '本科及以上',
    '大专',
    '中专中技',
    '高中',
    '初中',
    '小学及以下'
];

// 户口类型
var censusRegisterType = [
    '农业户口',
    '非农业户口'
];


// service type
var serviceType = [
    '职业介绍',
    '职业培训',
    '职业技能鉴定',
    '社会保险补贴',
    '公益性岗位安置',
    '小额担保贷款贴息',
    '小额担保贷款',
    '就业见习'
];

// extra service type
var extraService = [
    '场地租金补贴',
    '厂房免租金提供',
    '项目无息贷款',
    '特殊通道省批',
    '人力资源服务',
    '高科技扶持'
];

var workplace = [
    '县内',
    '县外市内',
    '市外省内',
    '省外',
    '境外'
];

// 培训类型
var trainingType = [
    '无',
    '职业培训',
    '创业培训',
    '企业高技能人才培训'
];

// 培训项目
var trainings = [
    '服装缝纫',
    '制鞋',
    '电子技术',
    '电脑',
    '家电维修',
    '电工',
    '焊工',
    '数控车床',
    '家政服务',
    '保安',
    '烹饪',
    '美容美发',
    '商业营销'
];
// 产业类型
var industry = [
    '第一产业',
    '第二产业',
    '第三产业'
];

// 现有技术等级
var technicalGrade = [
    '无',
    '初级技工',
    '中级技工',
    '高级技工',
    '技师',
    '高级技师'
];

// 就业形式
var jobForm = [
    '机关事业单位',
    '企业',
    '个体工商',
    '灵活就业',
    '自主创业',
    '公益性岗位',
    '务农',
    '其他'
];

// 人员身份
var humanCategory = [
    '纯农户农民',
    '返乡农民工',
    '高校毕业生',
    '复员军人',
    '待业失业人员',
    '其他'
];

// 失业原因
var unemploymentCause = [
    '其他符合失业登记条件',
    '从企业、机关、事业单位等各类用人单位失业',
    '个体工商户业主或者私营企业业主停业、破产停止经营',
    '承包土地被征用并符合规定条件',
    '从各类学校毕业、肄业',
    '军人退出现役且未纳入国家统一安置',
    '刑满释放、假释、监外执行或解除劳动教养'
];

// 困难群体情况
var familyType = [
    '4050人员',
    '军队退役人员',
    '零就业家庭',
    '城市低保人员',
    '身体残疾人员',
    '失地农民',
    '烈士家属',
    '抚养未成年子女单亲家庭',
    '其他'
];

// 参保情况
var insurance = [
    '城镇职工养老保险',
    '城镇居民养老保险',
    '新型农村养老保险',         // 新农保
    '城镇职工医疗保险',
    '城镇居民医疗保险',
    '失业保险',
    '工伤保险',
    '新型农村合作医疗保险'      // 新农合
];

module.exports = {
    nation: nations,
    workplace: workplace,
    province: provinces,
    education: education,
    censusRegisterType: censusRegisterType,
    politicalOutlook: politicalOutlook,
    technicalGrade: technicalGrade,
    trainingType: trainingType,
    training: trainings,
    industry: industry,
    serviceType: serviceType,
    extraService: extraService,
    jobForm: jobForm,
    humanCategory: humanCategory,
    unemploymentCause: unemploymentCause,
    familyType: familyType,
    insurance: insurance
};