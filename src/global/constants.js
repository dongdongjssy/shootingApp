import { Platform, Dimensions, PixelRatio, NativeModules, StatusBar } from 'react-native';
import base64 from 'react-native-base64';

const { StatusBarManager } = NativeModules;
const { width, height } = Dimensions.get('window');
global.SCREEN_WIDTH = width;
global.SCREEN_HEIGHT = height;

global._IOS_ = Platform.OS === 'ios';
global._ANDROID_ = Platform.OS === 'android';
global.ONE_PIXEL = 1 / PixelRatio.get();
global.ONE_PX = 1 / PixelRatio.get();

// iOS Only
if (_IOS_) {
    StatusBarManager.getHeight(statusBarHeight => {
        global.statusBarHeight = statusBarHeight.height
    });
} else {
    global.statusBarHeight = StatusBar.currentHeight;
}

export const IS_LOCAL = false;
export const API_RESPONSE_SUCCESS = 0;
export const GATEWAY_RESPONSE_SUCCESS = 200;
export const ONE_PX = 1 / PixelRatio.get();
export const SCREEN_WIDTH = width;
export const PRIMARY_COLOR = "#E60012";
export const BACK_COLOR = "#f5f6f8";
export const JG_APP_KEY = "d27e90395d0fc5adac3b3c65";
export const JG_MASTER_SECRET = "da08bfd3a4e04fe6af5f383e";
export const JG_API_TOKEN = "Basic " + base64.encode(JG_APP_KEY + ":" + JG_MASTER_SECRET);

global.PRIMARY_COLOR = PRIMARY_COLOR;
global.BACK_COLOR = BACK_COLOR;
global.messageToastLength = 5000;

const debug = {
    TEST_TITLE: 'debug模式',
    TYPE: 'debug',
    C: _IOS_ ? '1' : '2'

};

const staging = {
    TEST_TITLE: 'staging模式',
    TYPE: 'staging',
    CODE_PUSH_KEY: _IOS_ ? '6hlWD6F0GPkkLr_Qv6wcZVKyPihoL4KfL7W7U' : "SArUSst3UzMi_J8rzaeDuZ_K8vBMNHI0V1Rwd"
};

const release = {
    TEST_TITLE: 'release模式',
    TYPE: 'release',
    CODE_PUSH_KEY: _IOS_ ? 'KG1yVPzHQjsIkt_quEJ3KA5X5b1AzKIC3VA6R' : '4a9ykNDH41ZSn2dzJikqqjZQvqMBdGNmKbSMP'
};

// global.codepush_key=
if (__DEV__) {
    global.codepush_key = staging.CODE_PUSH_KEY
} else {
    global.codepush_key = release.CODE_PUSH_KEY
}


export const ClientStatusEnum = {
    NOT_VERIFIED: {
        code: 0,
        value: "未认证"
    },
    IN_REVIEW: {
        code: 1,
        value: "审核中"
    },
    VERIFIED: {
        code: 2,
        value: "已认证",
    },
    RENEWAL_USER: {
        code: 4,
        value: "待续费用户",
    },
}

export const RELEASE_STATUS = {
    IN_REVIEW: {
        code: 1,
        value: "审核中"
    },
    TB_BE_PAID: {
        code: 2,
        value: "待支付"
    },
    PAYMENT_TO_BE_CONFIRMED: {
        code: 3,
        value: "支付待确认"
    },
    REGISTRATION_PASSED: {
        code: 4,
        value: "报名通过"
    },
    REGISTRATION_FAILED: {
        code: 5,
        value: "报名失败"
    },
}


export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded;charset=UTF-8';
export const CONTENT_TYPE_JSON = "application/json;charset=UTF-8";
export const IS_IGNORE_LOGIN = false;
export const IS_PRODUCTION = true;
export const LOGIN_INFO = 'login_info';
export const PERM_INFO = 'perm_info';
export const SID = '@storage_Key';
export const TOKEN = '@token_Key';
export const USER_ID = '@user_Key';
export const DEPT_ID = '@dept_Key';
export const DEPT_Name = '@dept_Name';
export const DEV_ID = '@dev_Key';
export const IS_TABLE_STYLE = '@table_Key';
export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DEFAULT_DATE_TIME_MINUTE_FORMAT = "YYYY-MM-DD HH:mm";