import request from '@/utils/request'
import { mapState, mapGetters } from 'vuex'

// /**
//  * 获取区域列表
//  * @param {String} areaid 区域父ID，默认不传查省份
//  */
// export async function apiGetAreaInfo(areaid) {
//   const { data } = await request.get('/api/shopping/mall/v1/area/getareas', { areaid })
//   return data
// }

/**
 * 获取省列表
 */
export async function apiGetProvinces() {
  const { data } = await request.get('/api/v1/address/provinces')
  return data
}

/**
 *  根据省id获取市列表
 * @param {Number} provinceId
 */
export async function apiGetCitys(provinceId) {
  const { data } = await request.get(`/api/v1/address/cities?provinceId=${provinceId}`)
  return data
}

/**
 * 根据市id获取区列表
 * @param {Number} cityId
 */
export async function apiGetCounties(cityId) {
  const { data } = await request.get(`/api/v1/address/counties?cityId=${cityId}`)
  return data
}

/**
 * 提交用户信息
 * @param {object} userAddress
 * @param {string} userAddress.userId 用户id
 * @param {string} userAddress.province //省
 * @param {string} userAddress.provinceId
 * @param {string} userAddress.city //市
 * @param {string} userAddress.cityId
 * @param {string} userAddress.country //区
 * @param {string} userAddress.countyId
 * @param {1|0} userAddress.isDefault //默认地址 1默认0非默认
 *
 */
export async function apiPostAddress(userAddress) {
  const { data } = await request.post('/api/v1/user/save-address', userAddress)
  return data
}

export async function apiGetAddressList(userAddress) {
  const { data } = await request.get('/api/v1/user/address-list')
  return data
}

/**
 * 更新用户信息
 * @param {object} userInfo
 * @param {string} userInfo.nickName
 * @param {0|1|2} userInfo.gender 0未知 1男 2女
 */
export async function apiUpDateUserInfo(userInfo) {
  const { data } = await request.post('/api/v1/user/update-info', userInfo)
  return data
}
