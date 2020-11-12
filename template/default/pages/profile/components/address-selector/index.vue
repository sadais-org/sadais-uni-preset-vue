<template>
  <pi-popup :value="isShow" border-radius="40rpx 40rpx 0 0" @close="handleClosePopup">
    <view class="pi-align-center pi-mg-left-32" style="width: fit-content; height: 106rpx;">
      所在地区
    </view>
    <view class="pi-scroll-container">
      <scroll-view scroll-x class="pi-width-100P pi-pd-lr-32 pi-mg-tb-10">
        <view class="area-tabs   pi-flex-row pi-fz-28 pi-pd-bottom-15">
          <view
            v-for="(item, index) in tabsList"
            :key="index"
            class="area-tabs-item"
            :class="{ active: activedTab === item.id }"
            @tap="handleChangeTab(item)"
          >
            <view class="pi-align-center pi-flex-row">
              <view class="tabs-name tab-item-bg pi-pd-tb-4 pi-pd-lr-8 pi-radius-8 pi-mg-lr-2">
                {{ item.name }}
              </view>
              <view
                v-if="tabsList.length !== 1 && tabsList.length - 1 !== index"
                class="pi-mg-lr-20"
              >
                ›
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <scroll-view class="area-list pi-scroll" scroll-y>
        <view v-for="(item, key) in areaList" :key="key" class="area-list-item   pi-mg-top-5">
          <template v-if="item.length > 0">
            <view class="title   pi-pd-left-32 pi-height-64 pi-lh-64 pi-fz-24 pi-lh-500">
              {{ key }}
            </view>
            <view
              v-for="(itmObj, index) in item"
              :key="index"
              class="area-list-item-son   pi-mg-tb-48 pi-height-28 pi-fz-28 pi-lh-24 pi-pd-left-32 pi-flex-row pi-align-center"
              @tap="handleSelectArea(itmObj)"
            >
              <pi-img
                v-if="itmObj.id === activedTab"
                width="28"
                height="28"
                class="area-list-item-selected   pi-mg-right-10"
                mode="scaleToFill"
                :src="$consts.get('STATIC_IMG_URL') + 'common_ic_yuanxingxuanzhong.png'"
              />
              {{ itmObj.name }}
            </view>
          </template>
        </view>
      </scroll-view>
      <pi-bottom-bar fixed height="112" custom-class="pi-bg-white">
        <pi-button width="100%" type="primary" bg-color="#CA332C" @tap="handleConfirm">
          确定
        </pi-button>
      </pi-bottom-bar>
    </view>
  </pi-popup>
</template>

<script>
const TAG_NAME = 'AddressSelector'
export default {
  name: TAG_NAME,
  props: {
    // 所有省份，市区等
    areaList: {
      type: Object
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 地址： 省-市-区...
      tabsList: [
        {
          name: '请选择',
          id: '',
          fatherAreaId: ''
        }
      ],
      selectedTabsList: [],
      // tabList中选中项的id
      activedTab: ''
    }
  },
  watch: {
    areaList(value) {
      if (value.length === 1 && value[0].id === this.activedTab) {
        this.$emit('select', value)
      }
    }
  },
  methods: {
    handleChangeTab(item) {
      if (item.id === this.activedTab) return
      this.activedTab = item.id
      this.$emit('changeTab', item)
    },
    handleSelectArea(item) {
      item.hasNext === 0 && this.$emit('select', item)
      // this.$pi.common.toast.loading('请稍后', true)
      // 增加/修改当前选中的 tabsList
      this.tabsList.find((itm, index) => {
        if (itm.id === this.activedTab) {
          itm.id = item.id
          itm.name = item.name
          itm.level = item.level

          this.tabsList.splice(index + 1)
          return true
        }
      })
      this.selectedTabsList.length === 4 && this.selectedTabsList.splice(3)
      this.selectedTabsList.push(item.name)
      if (item.hasNext === 0) {
        this.tabsList.push({
          id: '',
          name: '请选择',
          fatherAreaId: item.id
        })
        this.activedTab = ''
      } else {
        this.activedTab = item.id
      }
      // this.$pi.common.toast.hideLoading()
    },
    handleConfirm() {
      if (this.tabsList.length !== 3 || !this.tabsList[2].id) return this.$toast('请选择完整地址')
      this.$emit('confirm', this.tabsList)
      this.$emit('close')
    },
    handleClosePopup() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.pi-scroll-container {
  flex: 1;
  height: initial;
}
.area-tabs {
  .area-tabs-item {
    flex-shrink: 0;
    &.active {
      .tabs-name {
        color: white;
        background-color: #ca332c;
        opacity: 0.4;
      }
    }
  }
}
.area-list {
  height: 600rpx;
  .area-list-item {
    .title {
      border-bottom: 1px solid #eeeeee;
    }
  }
}

.tab-item-bg {
  background: #f2f2f2;
}

/deep/.uni-scroll-view::-webkit-scrollbar {
  /* 隐藏滚动条，但依旧具备可以滚动的功能 */
  display: none;
}
</style>
