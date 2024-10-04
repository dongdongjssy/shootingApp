import {IS_LOCAL} from '../global/constants'

const HttpBaseConfig = {
    baseUrl:IS_LOCAL? 'http://10.0.2.2:':'http://47.105.158.8:',
    port: IS_LOCAL?'9006':'3306',
    prefix: IS_LOCAL?'/':'/',
    shareUrl:IS_LOCAL? 'http://zjw.tjjzshw.com/#/':'http://zjw.tjjzshw.com/#/',

  }

export default HttpBaseConfig
