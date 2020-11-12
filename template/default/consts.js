const STATIC_BASE_URL = 'https://huafa40oss.huafagroup.com'

const DEFAULT_CONSTS = {
  NAME: 'MARKETING', // 应用名称
  WX_APPID: 'wx948b2805e4e922c3', // 微信APPID
  SYSTEM: 'MP', // 系统
  VERSION: '1.0.5', // 版本号
  API_BASE_URL: 'https://40th-dev.huafagroup.com/', // 接口baseURL
  STATIC_BASE_URL, // 静态资源baseURL
  STATIC_IMG_URL: STATIC_BASE_URL + '/assets/img/',
  RET_CODE: { SUCCESS: '200', FAIL: 1, TOKEN_UNDEFINED: 19, TOKEN_EXPIRED: 2 } // 返回RET状态码解析
}
export default DEFAULT_CONSTS
