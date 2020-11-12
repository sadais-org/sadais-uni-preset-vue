<template>
  <view>
    <pi-navbar class="pi-fz-36 pi-fw-500">地址</pi-navbar>
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
          auto-height=""
          :auto-focus="false"
          placeholder="请输入详细地址"
          class="pi-mg-top-32 pi-fz-28 pi-w-100P"
        />
        <view v-show="isPop" class="pi-mg-top-32 pi-fz-28 pi-lh-34" style="word-wrap: break-word;">
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
const TAG_NAME = 'EditAddress'
import { apiGetProvinces, apiGetCitys, apiGetCounties, apiPostAddress } from '../edit-address/api'
import { mapState, mapMutations } from 'vuex'
import regions from '@/assets/json/regions.json'
import { apiGetAddressList } from './api'
export default {
  name: TAG_NAME,
  components: {},
  data() {
    return {
      defaultValue: { code: '', name: '' },
      formUserAddress: {},
      address: '',
      addressDetail: '',
      showSelector: false,
      isPop: false,
      savaAuthDeny: false // ios授权失败
    }
  },
  computed: {
    ...mapState(['userInfo']),
    titleStyle() {
      return {
        fontSize: '28rpx'
      }
    },
    regionsData() {
      return regions
    }
  },
  onLoad() {
    this.handleGetUserAddressList()
  },
  methods: {
    ...mapMutations(['changeUserInfo']),
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
    handleSelectorClose() {
      this.showSelector = false
      this.isPop = false
    },
    handleSelectAddress() {
      this.showSelector = true
      this.isPop = true
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
          this.address = [res.provinceName, res.cityName, res.countyName].join(' ')
          this.addressDetail = res.detailInfo
        },
        fail: err => {
          // 通过错误信息判断是授权失败还是取消选择
          if (err.errMsg === 'chooseAddress:fail auth deny') this.savaAuthDeny = true
          console.log(TAG_NAME, err)
        },
        complete(err) {
          console.log(err)
        }
      })
    },
    async handleGetUserAddressList() {
      const { code, data, msg } = await apiGetAddressList()
      if (code !== this.$consts.RET_CODE.SUCCESS) {
        uni.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        })
        return
      }
      if (!data.length) return
      const _data = data.reverse()
      this.formUserAddress = this.$pi.lang.cloneDeep(_data[0])
      this.address = [_data[0].province, _data[0].city, _data[0].county].join(' ')
      this.addressDetail = _data[0].detail
      this.defaultValue = {
        code: _data[0].countyId || '',
        name: ''
      }
    },
    async handleConfirm() {
      if (!this.addressDetail) return this.$toast('请填写详细地址')
      this.formUserAddress.userId = this.userInfo.id
      this.formUserAddress.isDefault = 0
      this.formUserAddress.detail = this.addressDetail
      const { code, msg } = await apiPostAddress(this.formUserAddress)
      if (code !== this.$consts.RET_CODE.SUCCESS) {
        uni.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        })
        return
      }
      this.changeUserInfo({ ...this.userInfo, address: this.address })
      uni.$emit('onAddressChange', this.address)
      uni.navigateBack()
    },
    // 在打开授权设置页并关闭后回调
    handleOpenSetting(e) {
      // 打开了收货地址授权  隐藏授权设置按钮
      if (e.detail.authSetting['scope.address']) {
        this.savaAuthDeny = false
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
