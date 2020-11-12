<template>
  <view class="pi-container" @tap="handleLogin">
    <view class="profile-header">
      <pi-navbar
        background="transparent"
        status-bar-background="transparent"
        :border-bottom="false"
      >
        <text slot="left" class="pi-white pi-pd-left-32 pi-fz-40 pi-fw-500">个人中心</text>
      </pi-navbar>
    </view>
    <view class="my-card pi-flex-column">
      <view class="pi-mg-top-50 pi-mg-left-40 pi-align-center">
        <!--  #ifdef MP-WEIXIN -->
        <open-data type="userAvatarUrl" class="user-avatar pi-round" />
        <!--  #endif -->
        <view class="pi-mg-left-34">
          <template v-if="isLogin">
            <!--  #ifdef MP-WEIXIN -->
            <open-data type="userNickName" class="pi-fz-32 pi-fw-500" />
            <!--  #endif -->
          </template>
          <template v-else>
            <view class="pi-fz-32 pi-fw-500 pi-mg-top-14" @tap="handleLogin">暂未登录</view>
          </template>
          <view v-if="isLogin" class="pi-fz-24 pi-mg-top-24 pi-gray">
            手机：{{ userInfo.phoneNumber }}
          </view>
          <view v-else class="pi-fz-24 pi-mg-top-24 pi-gray pi-align-center">
            点击去登录
            <pi-icon name="right" size="28" />
          </view>
        </view>
      </view>
      <pi-img
        mode="scaleToFill"
        :src="$consts.get('STATIC_IMG_URL') + 'my_pic_logo.png'"
        width="244"
        height="52"
        class="pi-mg-top-24 pi-mg-right-44 pi-self-end"
        style="min-height: 52rpx;"
      />
    </view>
    <pi-list title="个人信息" class="pi-mg-top-48">
      <pi-list-item title="姓名" :show-right-icon="false">
        <pi-img
          slot="left"
          :src="$consts.get('STATIC_IMG_URL') + 'my_ic_xingming.png'"
          height="48"
          width="48"
        />
        <input
          v-model="editUserInfo.nickName"
          type="text"
          placeholder="请输入姓名"
          placeholderStyle="font-weight: 400;color: #999999;"
          class="pi-text-right pi-fw-500"
          :disabled="!isLogin"
        />
      </pi-list-item>
      <pi-list-item title="性别">
        <pi-img
          slot="left"
          :src="$consts.get('STATIC_IMG_URL') + 'my_ic_xingbie.png'"
          height="48"
          width="48"
          custom-class="pi-primary"
        />
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
      <pi-list-item title="地址" @tap="handleToEdit">
        <pi-img
          slot="left"
          :src="$consts.get('STATIC_IMG_URL') + 'my_ic_dizhi.png'"
          height="48"
          width="48"
          custom-class="pi-primary"
        />
        <view class="pi-text-right pi-fw-500">
          {{ editUserInfo.address || '请选择地址' }}
        </view>
      </pi-list-item>
    </pi-list>
    <view class="pi-justify-center" style="margin-top: 108rpx;">
      <pi-button
        width="482"
        bg-color="#CA332C"
        color="white"
        radius="10"
        :disabled="canSubmit"
        class="confirm-btn pi-fz-32"
        @tap="handleSubmitUserInfo"
      >
        提交
      </pi-button>
    </view>
    <wx-auth v-model="showWxAuthModal" />
  </view>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { apiGetAddressList, apiUpDateUserInfo } from './pages/edit-address/api.js'
const TAG_NAME = 'Profile'
export default {
  name: TAG_NAME,
  data() {
    return {
      editUserInfo: { address: '', sex: '男', nickName: '' }, // 用户信息
      showWxAuthModal: false, // 是否显示授权弹窗
      currentIndex: 0
    }
  },
  computed: {
    ...mapState(['userInfo']),
    ...mapGetters(['isLogin']),
    sexs() {
      return [
        { value: 1, name: '男' },
        { value: 2, name: '女' }
      ]
    },
    canSubmit() {
      return (
        this.$pi.lang.isEmpty(this.editUserInfo.address) ||
        this.$pi.lang.isEmpty(this.editUserInfo.nickName)
      )
    }
    // address() {
    //   return this.userInfo.address
    // }
  },
  watch: {
    // 授权后，更新地址
    userInfo: {
      deep: true,
      immediate: true,
      async handler(value) {
        if (!this.isLogin) return
        const address = await this.handleGetUserAddressList()
        this.editUserInfo = {
          ...this.editUserInfo,
          ...this.$pi.lang.cloneDeep(value),
          address
        }
        this.currentIndex = this.editUserInfo.gender - 1 || 0
      }
    }
  },
  async onShow() {
    // 因为授权调用了uni.hideTabBar()，防止用户授权时候关闭小程序，下一次进入就不会显示tabbar了
    uni.showTabBar()
    if (!this.isLogin) return
    this.editUserInfo = {
      ...this.editUserInfo,
      ...this.$pi.lang.cloneDeep(this.userInfo)
    }
    const address = await this.handleGetUserAddressList()
    this.currentIndex = this.editUserInfo.gender - 1 || 0
  },
  methods: {
    ...mapActions(['initUserInfo']),
    handleRadioChange(e) {
      this.editUserInfo.sex = this.sexs[Number(e.detail.value) - 1].name
    },
    handleToEdit() {
      uni.$once('onAddressChange', newAddress => {
        this.editUserInfo.address = newAddress
      })
      this.isLogin && this.$pi.navi.navigateTo('pages/profile/pages/edit-address/index')
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
      if (!data.length) return ''
      return [data[0].province, data[0].city, data[0].county].join(' ')
    },
    handleLogin() {
      !this.isLogin && (this.showWxAuthModal = true)
    },

    async handleSubmitUserInfo() {
      if (this.editUserInfo.nickName.length > 15) {
        this.$toast('昵称最长为15个字符')
        return
      }
      const { code, msg } = await apiUpDateUserInfo({
        nickName: this.editUserInfo.nickName,
        gender: this.editUserInfo.sex === '男' ? 1 : 2
      })
      await this.initUserInfo()
      uni.showToast({
        title: code !== this.$consts.RET_CODE.SUCCESS ? msg : '更新成功',
        duration: 2000,
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pi-container {
  .profile-header {
    height: 352rpx;
    background: url($STATIC_IMG_URL+'my_bg.png') no-repeat top center/100% auto;
  }

  .user-avatar {
    width: 105rpx;
    height: 105rpx;
    background: #ffffff;
    border: 2rpx solid rgba(249, 196, 142, 0.8);
  }

  .my-card {
    width: 724rpx;
    height: 274rpx;
    margin: -150rpx auto 0 auto;
    background: url($STATIC_IMG_URL+'my_bg_kapian.png') no-repeat;
    background-size: 100% 100%;
  }
}
</style>
