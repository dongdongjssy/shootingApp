/** 统一定义接口，有利于维护 **/
import { IS_LOCAL } from '../global/constants'

const IS_USING_GATEWAY = true

const SERVER_URL = IS_LOCAL ? 'http://10.0.2.2' : 'http://47.105.158.8'//http://qwerty.cn.utools.club   //http://47.105.158.8
const PORT = IS_LOCAL ? ':9004' : ':9006'//:9006

const BASE_URL = SERVER_URL + PORT

const IMG_BASE_URL = 'https://cpsa-oss.oss-cn-beijing.aliyuncs.com'

const SHOOTING_SERVICE = IS_USING_GATEWAY ? '/shooting-service' : ''

// 极光IM REST API地址。
// 极光IM的RN插件已经包装了REST API，但是如果发现RN插件中的方法无法使用或返回数据有差异，可以考虑直接调用REST API。
// API详细文档可以参考：https://docs.jiguang.cn/jmessage/server/rest_api_im/
const JG_IM_BASE_URL = 'https://api.im.jpush.cn'

const API_AUTH = BASE_URL + '/shooting';
const API_SHOOTING = BASE_URL + SHOOTING_SERVICE + '/shooting';
const API_CLIENT = BASE_URL + SHOOTING_SERVICE + '/client';

const URL = {
	// auth api
	SEND_SMS: API_AUTH + '/sms/sendSms',
	LOGIN_BY_PHONE: API_AUTH + '/auth/loginByPhone',
	VALIDAATE_TOKEN: API_AUTH + '/auth/validate',
	SEND_EMAIL: API_SHOOTING + '/email/sendEmail',
	LOGIN_BY_EMAIL: API_SHOOTING + '/visitor/login',
	VALIDATE_PASSWORD: API_AUTH + '/auth/updatePassword',

	//广告
	STARTADVERTISEMENT_LIST: API_SHOOTING + '/startAdvertisement/startList',

	//规则
	RANKINSTRUCTIONS_LIST: API_SHOOTING + '/rankInstructions/list',

	// shooting api
	RECOMMEND_LIST: API_SHOOTING + '/recommend/list',
	RECOMMEND_GET_DETAIL_BY_ID: API_SHOOTING + '/recommend/getById/',
	RECOMMEND_EDIT: API_SHOOTING + '/recommend/edit',
	POST_ADD: API_SHOOTING + '/post/addPost',
	POST_LIST: API_SHOOTING + '/post/list',
	POST_LIST_PAGE: API_SHOOTING + '/post/list/page',
	POST_EDIT: API_SHOOTING + '/post/edit',
	POST_DEL_BY_ID: API_SHOOTING + '/post/remove/',
	TRAINING_LIST: API_SHOOTING + '/training/list/page',
	TRAINING_BY_ID: API_SHOOTING + '/training/getById/',
	CONTEST_LIST: API_SHOOTING + '/contest/list/page', //国际赛事
	CONTEST_BY_ID: API_SHOOTING + '/contest/getById/',
	CAROUSEL_LIST: API_SHOOTING + '/carousel/list',
	AREA_LIST: API_SHOOTING + '/area/list',
	COURSE_LIST: API_SHOOTING + '/course/list',
	TYPE_LIST: API_SHOOTING + '/type/list',
	LEVEL_LIST: API_SHOOTING + '/contestLevelCoeff/list',
	SHOOTING_TYPE_LIST: API_SHOOTING + '/type/list',
	COMMENT_ADD: API_SHOOTING + '/comment/add',
	COMMENTS_LIST_ALL: API_SHOOTING + '/comment/listAll',
	FEEDBACK_ADD: API_SHOOTING + '/commentFeedback/add',
	REGISTER_ADD: API_SHOOTING + '/register/add',
	REGISTER_GET_BY_ID: API_SHOOTING + '/register/getById/',
	REGISTER_LIST: API_SHOOTING + '/register/list',
	REGISTER_EDIT: API_SHOOTING + '/register/edit',
	CLUB_LIST: API_SHOOTING + '/club/list',
	CLUB_GET_BY_ID: API_SHOOTING + '/club/getById/',
	CLUB_CATEGORY_LIST: API_SHOOTING + '/club/clubCategoryList',
	CLUB_COACH_BY_CLUB_ID: API_SHOOTING + '/clubCoach/getByClubId/',
	CLUB_JUDGE_BY_CLUB_ID: API_SHOOTING + '/clubJudge/getByClubId/',
	CLUB_ACTIVITY_BY_CLUB_ID: API_SHOOTING + '/clubActivity/getByClubId/',
	CLUB_ACTIVITY_BY_ID: API_SHOOTING + '/clubActivity/getById/',
	CLUB_POST_BY_CLUB_ID: API_SHOOTING + '/clubPost/getByClubId/',
	CLUB_POST_DETAIL_BY_ID: API_SHOOTING + '/clubPost/getById/',
	CLUB_IMAGE_BY_CLUB_ID: API_SHOOTING + '/clubImage/getByClubId/',
	JUDGE_GROUP_LIST: API_SHOOTING + '/recommendJudge/list',
	COACH_GROUP_LIST: API_SHOOTING + '/recommendCoach/list',
	USER_LIKE_LIST: API_SHOOTING + '/userLike/list',
	USER_LIKE_ADD: API_SHOOTING + '/userLike/add',
	USER_LIKE_DEL: API_SHOOTING + '/userLike/remove/',
	USER_LIKE_REMOVE: API_SHOOTING + '/userLike/remove/userLike',
	USER_COLLECTION_LIST: API_SHOOTING + '/userCollection/list',
	USER_COLLECTION_ADD: API_SHOOTING + '/userCollection/add',
	USER_COLLECTION_DEL: API_SHOOTING + '/userCollection/remove/',
	USER_COLLECTION_POST: API_SHOOTING + '/userCollection/getPostByUserId/',
	USER_COLLECTION_ACTIVITY: API_SHOOTING + '/userCollection/getActivityByUserId/',
	USER_FOLLOW_LIST: API_SHOOTING + '/userFollow/list',
	USER_FOLLOW_ADD: API_SHOOTING + '/userFollow/add',
	USER_FOLLOW_DEL: API_SHOOTING + '/userFollow/remove/',
	USER_FOLLOW_POSTS: API_SHOOTING + '/userFollow/myFollowPosts',
	USER_READ_ADD: API_SHOOTING + '/userRead/add',
	MY_CLUB_LIST: API_SHOOTING + '/myClub/list',
	MY_CLUB_LIST_ASSOC: API_SHOOTING + '/myClub/listAssoc',
	MY_CLUB_ADD: API_SHOOTING + '/myClub/add',
	MY_CLUB_DEL: API_SHOOTING + '/myClub/remove/',
	MY_CLUB_POST: API_SHOOTING + '/myClub/getPostByUserId/',
	JOIN_CLUB_APPLICATION_LIST: API_SHOOTING + '/clubJoinApplication/list',
	JOIN_CLUB_APPLICATION_ADD: API_SHOOTING + '/clubJoinApplication/add',
	JOIN_CLUB_APPLICATION_DEL: API_SHOOTING + '/clubJoinApplication/remove/',

	RANK_PAGE_YEAR_LIST: API_SHOOTING + '/contestStats/getYear',
	RANK_PAGE_SCORE_LIST: API_SHOOTING + '/contestStats/getStats',
	MATCH_RANK_SCORE_LIST: API_SHOOTING + "/contestContestRanking/contestRanking",
	MATCH_RANK_AREA_FILTER: API_SHOOTING + "/area/list",
	MATCH_RANK_COURSE_LIST: API_SHOOTING + "/contestGroup/getGroup",
	MATCH_RANK_AGE_GROUP_LIST: API_SHOOTING + "/contestStats/getAgeGroup",
	MATCH_RANK_LIST: API_SHOOTING + "/contestContestRanking/contestRankingByContestId",

	MINE_RESULT_LIST: API_SHOOTING + "/contestStats/findMyMark",
	MINE_RESULT_DETAIL: API_SHOOTING + "/contestContestRanking/getById",

	MINE_RESULT_LIST: API_SHOOTING + "/contestStats/findMyMark",

	ADS_LIST: API_SHOOTING + "/advertisement/list",
	BUSINESS_INVESTMENT_LIST: API_SHOOTING + '/businessInvestment/list',

	CALENDAR_LIST: API_SHOOTING + '/contest/list/calendar',

	UPLOADPIC: API_SHOOTING + '/post/uploadPic',
	USERINTEGRAL_LIST: API_SHOOTING + '/userIntegral/list/page',
	USERINTEGRAL_ADD: API_SHOOTING + '/userIntegral/add',
	USERINTEGRAL_DETAIL: API_SHOOTING + '/userIntegralDetail/list/page',

	//system message
	SYSTEM_MESSAGE_LIST: API_SHOOTING + "/message/listByUser",
	//培训详情
	SYSTEM_MESSAGE_TRAIN_DETAIL: API_SHOOTING + "/training/getById",
	//赛事详情
	SYSTEM_MESSAGE__MATCH_DETAIL: API_SHOOTING + "/contest/getById",
	//教官详情
	SYSTEM_MESSAGE_COACH_DETAIL: API_SHOOTING + "/recommendCoach/getById",
	//裁判详情
	SYSTEM_MESSAGE_JUDGE_DETAIL: API_SHOOTING + "/recommendJudge/getById",
	//系统消息详情获取富文本内容
	SYSTEM_MESSAGE_CONTENT_DETAIL: API_SHOOTING + "/message/getById",
	//关于我们
	FIND_ZH: API_SHOOTING + "/zh/list",
	// client api
	USER_GET_BY_ID: API_CLIENT + '/clientUser/getById/',
	USER_LIST: API_CLIENT + '/clientUser/list',
	USER_ROLE_LIST: API_CLIENT + '/userRole/list',
	FIND_USER_BY_PHONE_OR_USERNAME: API_CLIENT + '/clientUser/getByPhoneOrUsername/',
	USER_EDIT: API_CLIENT + '/clientUser/edit',
	USER_UPLOAD_ID: API_CLIENT + '/clientUser/uploadId',
	USER_UPLOAD_AVATAR: API_CLIENT + '/clientUser/uploadAvatar',
	SEARCH: API_CLIENT + '/clientUser/search',
	EDIT_PASSWORD: API_CLIENT + '/clientUser/editPassword',

	//培训意向
	TRAININGINTENTION_ADD: API_SHOOTING + '/trainingIntention/add',
	TRAININGINTENTION_LIST: API_SHOOTING + '/trainingIntention/list',
	TRAININGINTENTION_CLUB_LIST: API_SHOOTING + '/club/hotList',

	//荣誉榜
	HONOR_LIST: API_SHOOTING + '/honor/list',

	//商城
	SHOPPING_LIST:API_SHOOTING + '/goods/list/page',  //商品列表
	GOODS_DETAIL:API_SHOOTING + '/goods/getById/',    //商品详情
	SHOPPING_BANNER:API_SHOOTING + '/goodsCarousel/list/page', //商品轮播图
	SHOPPING_TITLE:API_SHOOTING + '/goodsType/list', //商品类型

	GOODS_ATTRIBUTE_BYGOODSID:API_SHOOTING + '/goodsAttribute/selectGoodsAttributeByGoodsId', //通过商品查商品属性

	SHOPPING_CAR_LIST:API_SHOOTING + '/goodsShoppingCart/list/page', //购物车
	SHOPPING_CAR_ADD:API_SHOOTING + '/goodsShoppingCart/add', //新增购物车
	SHOPPING_CAR_DELETE:API_SHOOTING + '/goodsShoppingCart/remove/', //删除购物车
	SHOPPING_CAR_DELETE_IDS:API_SHOOTING + '/goodsShoppingCart/remove', //删除购物车


	SHOPPING_GT:API_SHOOTING + '/gt/getNums', //查库存

	EVA_LIST:API_SHOOTING +'/goodsEvaluation/list/page', //评价列表
	ADD_EVA:API_SHOOTING +'/goodsEvaluation/add', //新增评价


	GOODS_ADDRESS_BYID:API_SHOOTING + '/goodsAddress/getById/', //收货地址查看
	GOODS_ADDRESS_LIST:API_SHOOTING + '/goodsAddress/list/page', //收货地址列表
	GOODS_ADDRESS_UPDATE:API_SHOOTING + '/goodsAddress/edit',    //收货地址修改
	GOODS_ADDRESS_DELETE:API_SHOOTING + '/goodsAddress/remove/', //收货地址删除
	GOODS_ADDRESS_ADD:API_SHOOTING + '/goodsAddress/add',   //收货地址新增
	GOODS_ADDRESS_EDIT:API_SHOOTING + '/goodsAddress/edit', //收货地址修改

	GOODS_INVOICE_LIST:API_SHOOTING + '/goodsInvoice/list/page', //发票列表
	GOODS_INVOICE_DELETE:API_SHOOTING + '/goodsInvoice/remove/', //发票删除
	GOODS_INVOICE_EDIT:API_SHOOTING + '/goodsInvoice/edit', //发票修改
	GOODS_INVOICE_ADD:API_SHOOTING + '/goodsInvoice/add',  //发票新增

	GOODS_ORDER_LIST:API_SHOOTING + '/goodsOrder/list/page', //订单列表
	GOODS_ORDER_EDIT:API_SHOOTING + '/goodsOrder/edit', //修改订单
	
	GOODS_ORDER_NUM:API_SHOOTING + '/goodsOrder/list/selectGoodStatusByUserId',

	ORDER_UPLOAD:API_SHOOTING + '/order/uploadPic', //上传付款图

	ORDER_ADD:API_SHOOTING + '/order/add', //下单

	ORDER_BYID:API_SHOOTING + '/order/getById/', //查大订单订单号

	ORDER_CANCEL : API_SHOOTING + '/order/cancle', //取消订单 （合并取消）

	ORDER_EDIT : API_SHOOTING + '/order/edit', //修改大订单

	GOODS_ORDER_BYID:API_SHOOTING + '/goodsOrder/getById/', //查询订单


	// 极光 REST API
	JG_GET_USER_INFO: JG_IM_BASE_URL + '/v1/users/',

	// TODO： 图片视频url（静态文件，不需要token），应该在后台配置一个/resources/** 映射加到不需要认证的列表中
	// client user avatar image uri
	CLIENT_USER_IMAGE: IMG_BASE_URL + '/shooting/clientUser/',
	RECOMMEND_IMAGE: IMG_BASE_URL + '/shooting/recommend/',
	POST_IMAGE: IMG_BASE_URL + '/shooting/post/',
	TRAINING_IMAGE: IMG_BASE_URL + '/shooting/training/',
	CONTEST_IMAGE: IMG_BASE_URL + '/shooting/contest/',
	CAROUSEL_IMAGE: IMG_BASE_URL + '/shooting/carousel/',
	CLUB_IMAGE: IMG_BASE_URL + '/shooting/club/',
	CLUB_ACTIVITY_IMAGE: IMG_BASE_URL + '/shooting/clubActivity/',
	CLUB_POST_IMAGE: IMG_BASE_URL + '/shooting/clubPost/',
	JUDGE_IMAGE: IMG_BASE_URL + '/shooting/judge/',
	COACH_IMAGE: IMG_BASE_URL + '/shooting/coach/',
	ADS_IMAGE: IMG_BASE_URL + '/shooting/advertisement/',
	ROLE_IMAGE: IMG_BASE_URL + '/shooting/role/',

	NEW_CLUB_IMAGE: IMG_BASE_URL + '/shooting/club/',
	NEW_CLIENT_USER_IMAGE: IMG_BASE_URL + '/shooting/clientUser/',

	ADVETTISEMENT_IMAGE: IMG_BASE_URL + '/shooting/startAdvertisement/',
	PAYMENT_IMAGE: IMG_BASE_URL + '/shooting/paymentCode/',
	HONOR_IMAGE: IMG_BASE_URL + '/shooting/honor/',

	GOODSBANNER_IMAGE: IMG_BASE_URL + '/shooting/goodsCarousel/',
	GOODS_IMAGE : IMG_BASE_URL + '/shooting/goods/',
	ORDER_IMAGE : IMG_BASE_URL + '/shooting/order/',
	RULE_PDF: IMG_BASE_URL + '/shooting/rule/',

}

export default URL