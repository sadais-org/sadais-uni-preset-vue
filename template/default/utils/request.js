import request from '@/sadais-core/core/request'
import store from '@/store'
import { removeUserInfo, removeTokenId } from '@/sadais-core/core/auth'

// response拦截器
request.interceptors.response.use(async response => {
  if (response.data.code === '1401') {
    // 授权过期，删除用户信息
    store.commit('changeUserInfo', null)
    removeTokenId()
    removeUserInfo()
  }
  return response
})

export default request

export const get = request.get
export const post = request.post
export const put = request.put
export const del = request.del
