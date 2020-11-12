import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo, saveUserInfo } from '@/sadais-core/core/auth'

Vue.use(Vuex)

const state = {
  userInfo: getUserInfo()
}

const mutations = {
  changeState(state, { key = '', value = '' }) {
    state[key] = value
  },
  changeUserInfo(state, payload) {
    state.userInfo = payload
    saveUserInfo(payload)
  }
}

const actions = {}

const getters = {
  isLogin(state) {
    return !!state.userInfo
  }
}

const store = new Vuex.Store({
  strict: true,
  state,
  mutations,
  actions,
  getters
})

export default store
