<template>
  <view>
    <pi-navbar class="pi-fz-36 pi-fw-500">个人信息</pi-navbar>
    <pi-gap height="20" />
    <view class="pi-rela">
      <pi-button
        v-show="savaAuthDeny"
        bg-color="transparent"
        width="100%"
        custom-class="pi-abso-tl"
        class="pi-abso-tl pi-w-100P"
        style="z-index: 2;"
        :custom-style="{ height: '110rpx' }"
        open-type="openSetting"
        @opensetting.stop="handleOpenSetting"
      />
      <pi-list-item title="从微信选择地址" :title-style="titleStyle" @tap="handleChooseAddress" />
    </view>
    <pi-gap height="20" />
    <pi-list-item title="姓名" :show-right-icon="false">
      <input
        v-model="editUserInfo.nickName"
        type="text"
        placeholder="请输入姓名"
        placeholderStyle="font-weight: 400;color: #999999;"
        class="pi-text-right pi-fw-500"
        :disabled="!isLogin"
      />
    </pi-list-item>
    <pi-list-item title="手机号码" :show-right-icon="false">
      <view class="pi-text-right pi-fw-500" style="color: #999999;">
        {{ editUserInfo.phoneNumber }}
      </view>
    </pi-list-item>
    <pi-list-item title="性别">
      <radio-group slot="right" class="pi-flex" @change="handleRadioChange">
        <label v-for="(item, index) in sexs" :key="item.value" class="pi-align-center">
          <view>
            <radio
              :value="item.value"
              :checked="index === currentIndex"
              style="transform: scale(0.7);"
            />
          </view>
          <view>{{ item.name }}</view>
        </label>
      </radio-group>
    </pi-list-item>
    <pi-list-item title="地址" :title-style="titleStyle" @tap="handleSelectAddress">
      <view class="pi-text-right">{{ address || '请选择地址' }}</view>
    </pi-list-item>
    <pi-gap height="20" />
    <view class="pi-pd-32">
      <view class="pi-solid-bottom-2 pi-pd-bottom-24">
        <view class="pi-fz-28">详细地址</view>
        <textarea
          v-show="!isPop"
          v-model="addressDetail"
          auto-height
          placeholder="请输入详细地址"
          class="pi-mg-top-32 pi-fz-28 pi-w-100P"
          style="z-index: 1;"
        />
        <view v-show="isPop" class="pi-mg-top-32 pi-fz-28 pi-w-100P" style="word-wrap: break-word;">
          {{ addressDetail || '请输入详细地址' }}
        </view>
      </view>
    </view>
    <pi-bottom-bar fixed height="112">
      <pi-button width="100%" type="primary" bg-color="#CA332C" @tap="handleConfirm">
        提交
      </pi-button>
    </pi-bottom-bar>
    <pi-regions-select
      v-model="showSelector"
      :regions-data="regionsData"
      :default-value="defaultValue"
      show-title
      height="60vh"
      toolbar-position="bottom"
      border-radius="24rpx 24rpx 0 0"
      append-to-body
      @confirm="handleSelectConfirm"
      @close="handleSelectorClose"
    />
  </view>
</template>

<script>
const TAG_NAME = 'EditUserInfo'
import {
  apiGetProvinces,
  apiGetCitys,
  apiGetCounties,
  apiGetAddressList,
  apiUpDateUserInfo,
  apiPostAddress
} from '../edit-address/api'
import { mapState, mapGetters, mapActions } from 'vuex'
import regions from '@/assets/json/regions.json'
export default {
  name: TAG_NAME,
  components: {},
  data() {
    return {
      // 用户信息
      editUserInfo: {
        nickName: '',
        phoneNumber: '',
        gender: 1
      },
      defaultValue: { code: '', name: '' },
      address: '',
      addressDetail: '',
      formUserAddress: {},
      currentIndex: 0,
      showSelector: false,
      isPop: false,
      savaAuthDeny: false // ios授权标志
    }
  },
  computed: {
    ...mapState(['userInfo']),
    ...mapGetters(['isLogin']),
    // list-item 的title样式
    titleStyle() {
      return {
        fontSize: '28rpx'
      }
    },
    sexs() {
      return [
        { value: 1, name: '男' },
        { value: 2, name: '女' }
      ]
    },
    regionsData() {
      return regions
    }
  },
  watch: {
    userInfo: {
      immediate: true,
      deep: true,
      async handler(value) {
        const address = await this.handleGetUserAddressList()
        this.editUserInfo = { gender: 1, ...value, address }
        this.address = address
        this.currentIndex = this.userInfo.gender - 1 || 0
      }
    }
  },
  onLoad() {
    // this.handleGetUserAddressList()
  },
  methods: {
    ...mapActions(['initUserInfo']),
    handleSelectConfirm(addressList) {
      this.formUserAddress = {
        // 省
        province: addressList.province.name,
        provinceId: addressList.province.code,
        // 市
        city: addressList.city.name,
        cityId: addressList.city.code,
        // 区
        county: addressList.county.name,
        countyId: addressList.county.code
      }
      this.address = `${addressList.province.name} ${addressList.city.name} ${addressList.county.name}`
      this.defaultValue = addressList.county.code
    },
    // 在打开授权设置页并关闭后回调
    handleOpenSetting(e) {
      // 打开了收货地址授权  隐藏授权设置按钮
      if (e.detail.authSetting['scope.address']) {
        this.savaAuthDeny = false
      }
    },
    // 获取微信的收货地址
    handleChooseAddress() {
      uni.chooseAddress({
        success: res => {
          this.formUserAddress = {
            // 省
            province: res.provinceName,
            // provinceId: '',
            // 市
            city: res.cityName,
            // cityId: '',
            // 区
            county: res.countyName
            // countyId: ''
          }
          this.editUserInfo.nickName = this.userInfo.nickName || res.userName
          this.address = [res.provinceName, res.cityName, res.countyName].join(' ')
          this.addressDetail = res.detailInfo
          console.log(TAG_NAME, '微信地址', res.nationalCode)
        },
        fail: err => {
          // 通过错误信息判断是授权失败还是取消选择
          if (err.errMsg === 'chooseAddress:fail auth deny') this.savaAuthDeny = true
          console.log(TAG_NAME, err, 'fail')
        },
        complete(err) {
          console.log(TAG_NAME, err, 'complete')
        }
      })
    },
    async handleGetUserAddressList() {
      const { code, data, msg } = await apiGetAddressList()
      if (code !== this.$consts.RET_CODE.SUCCESS) {
        return uni.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        })
      }
      if (!data.length) return ''
      this.formUserAddress = this.$pi.lang.cloneDeep(data[0])
      this.address = [data[0].province, data[0].city, data[0].county].join(' ')
      this.addressDetail = data[0].detail
      this.defaultValue = {
        code: data[0].countyId || '',
        name: ''
      }
      return this.$pi.lang.cloneDeep(this.address)
    },
    // 提交修改
    handleConfirm() {
      // 表单校验
      if (!this.editUserInfo.nickName) return this.$toast('请填写完整信息')
      if (this.editUserInfo.nickName.length > 15) return this.$toast('用户昵称最长为15个字符')
      // 手机号正则
      const reg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/g
      if (!reg.test(this.editUserInfo.phoneNumber)) return this.$toast('请输入正确的手机号')
      if (this.$pi.lang.isEmpty(this.address)) return this.$toast('请选择地址')
      if (this.$pi.lang.isEmpty(this.addressDetail)) return this.$toast('请输入详细地址')
      // 地址和用户信息分开保存的
      // 存地址

      this.handleSaveAddress()
      // 存用户信息
      this.handleUpdateUserInfo()
    },
    // 保存地址
    async handleSaveAddress() {
      this.formUserAddress.userId = this.userInfo.id
      this.formUserAddress.isDefault = 0
      this.formUserAddress.detail = this.addressDetail
      const { code, msg } = await apiPostAddress(this.formUserAddress)
      if (code !== this.$consts.RET_CODE.SUCCESS) {
        this.$toast(msg)
        return
      }
    },
    // 保存用户信息
    async handleUpdateUserInfo() {
      const { code, msg } = await apiUpDateUserInfo(this.editUserInfo)
      if (code !== this.$consts.RET_CODE.SUCCESS) {
        this.$toast(msg)
        return
      }
      this.$toast('提交成功')
      this.isLogin && this.initUserInfo()
      setTimeout(() => this.$pi.navi.switchTab('pages/index/index'), 1000)
    },
    // 改变性别
    handleRadioChange(e) {
      this.editUserInfo.gender = Number(e.detail.value)
    },
    handleSelectAddress() {
      this.showSelector = true
      this.isPop = true
    },
    handleSelectorClose() {
      this.showSelector = false
      this.isPop = false
    }
  }
}
</script>

<style lang="scss" scoped></style>
