<template>
  <view>
    <pi-status-bar background="#a1050c" />
    <view class="banner-wrap">
      <pi-img
        src="http://sadais-oss.oss-cn-hangzhou.aliyuncs.com/huafa/ma/upload/ac3af321-9836-4749-a045-3ba7cf4dae72.png"
      />
      <view class="pi-justify-center">
        <pi-img :src="$consts.get('STATIC_IMG_URL') + 'home_title_miaosha.png'" width="270" />
      </view>
    </view>
  </view>
</template>

<script>
const TAG_NAME = 'Index'
export default {
  name: TAG_NAME,
  components: {}
}
</script>

<style lang="scss">
page {
  background-color: #a1050c;
}
</style>

<style lang="scss" scoped>
.banner-wrap {
  background: #a1050c;
}
.product-wrap {
  padding: 0 32rpx 32rpx 32rpx;
  background: #a1050c;
  .product-item-wrap:not(:last-child) {
    margin-bottom: 20rpx;
  }
}
</style>
