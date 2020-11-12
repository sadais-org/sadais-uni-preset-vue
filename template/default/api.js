import request from '@/utils/request'
import { getConsts } from '@/sadais-core/consts'

/**
 * 手机号授权登录
 * @param {*} code 授权Code
 * @param {*} encryptedData 加密数据
 * @param {*} iv iv
 */
export const apiWxPhoneLogin = async (code, encryptedData, iv) => {
  const { data } = await request.post('/api/v1/user/ma-phone-login', {
    appId: getConsts('WX_APPID'),
    code,
    encryptedData,
    iv
  })
  return data
}

/**
 * 下单购买
 * @param {String} activityId 活动id
 * "products": [
 *  {
 *    "productId": 0,
 *    "quantity": 0,
 *    "secKillActivityProductId": 0
 *  }
 * ]
 */
export const apiPostOrderBuy = async products => {
  const { data } = await request.post('/api/v1/order/buy', products)
  return data
}

/**
 * 获取用户信息
 */
export const apiGetUserInfo = async () => {
  const { data } = await request.get('/api/v1/user/info')
  return data
}
