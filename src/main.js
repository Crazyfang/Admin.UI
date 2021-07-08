// 浏览器兼容性
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'

import ElementUI from 'element-ui'
import Pagination from '@/components/ElementUI/Pagination'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.min.css'

import '@babel/polyfill'
import Es6Promise from 'es6-promise'
Es6Promise.polyfill()

import lodash from 'lodash'
import i18n from './lang' // 国际化

import $ from 'jquery'

import '@/styles/index.scss'

import App from './App.vue'
import store from './store'
import router from './router'
import signalr from './utils/signalR'
import Plugin from 'v-fit-columns'
Vue.use(signalr)

Vue.use(ElementUI, {
  size: 'mini', // large / medium / small / mini
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(Pagination)
Vue.use(Plugin)
Vue.config.productionTip = false

Vue.prototype.$_ = lodash

Vue.directive('dateFormat', {
  inserted: function(el, binding, vnode) {
    const { value: _obj } = binding
    const { context: _this, data } = vnode
    const { expression: key } = data.model
    let arr = []
    const modelValue = function(value, len) {
      // 判断输入的时间为几位数，正则匹配相应的事件格式。可直接采用moment转换,更直接。
      if (value.substring(4, 5) === '-' && value.substring(7, 8) === '-') {
        return true
      } else {
        if (value.length > 5 && value.length < 9) {
          value = value.replace(/^(\d{4})\D*(\d{1,2})\D*(\d{1,2})\D*/, '$1-$2-$3') // 格式化输入格式,2021-03-01
        } else if (value.length > 9 && value.length < 13) {
          value = value.replace(/^(\d{4})\D*(\d{1,2})\D*(\d{1,2})\D*(\d{1,2})\D*(\d{1,2})\D*/, '$1-$2-$3 $4:$5') // 格式化输入格式,2021-03-01 09:50
        } else if (value.length > 12) {
          value = value.replace(/^(\d{4})\D*(\d{1,2})\D*(\d{1,2})\D*(\d{1,2})\D*(\d{1,2})\D*(\d{1,2})\D*/, '$1-$2-$3 $4:$5:$6') // 格式化输入格式,2020-03-01 09:50:30
        } else {
          return false
        }
      }
      // const newValue = value.replace(/-/g,"/"); //解决前台new Date（yyyy-MM-dd）转化时间相差8小时的问题,不知道靠不靠谱，改用moment
      // const time = value && value.constructor == String ? new Date(newValue) : value  // 转换时间格式
      const time = value && value.constructor === String ? new Date(value) : value // 转换时间格式
      const keys = key.split('.')
      if (arr.length === len) {
        arr = []
      }
      arr.push(time)
      // 判断指令是否有传值，是否有传数组的名称跟索引值，原因：转换出来的时间控件_this[key1][key2]取不到绑定的相关值
      if (!_obj) {
        // 处理简单的绑定
        if (keys && keys.length >= 2) {
          const [key1, key2, key3, key4] = keys
          if (key4) {
            _this[key1][key2][key3][key4] = len === 2 ? arr : time
          } else if (key3) {
            _this[key1][key2][key3] = len === 2 ? arr : time
          } else {
            _this[key1][key2] = len === 2 ? arr : time
          }
        } else {
          _this[key] = len === 2 ? arr : time
        }
      } else {
        // 处理循环中的时间控件绑定，需要传值，再去相应的数组中查找相应的字段赋值
        const objKey = _obj.obj.split('.')
        if (objKey && objKey.length >= 2) {
          // 解构赋值
          const [flag1, flag2, flag3, flag4] = objKey
          // _obj.index：索引，_obj.modelName：绑定的字段名
          if (flag4) {
            _this[flag1][flag2][flag3][flag4][_obj.index][_obj.modelName] = len === 2 ? arr : time
          } else if (flag3) {
            _this[flag1][flag2][flag3][_obj.index][_obj.modelName] = len === 2 ? arr : time
          } else {
            _this[flag1][flag2][_obj.index][_obj.modelName] = len === 2 ? arr : time
          }
        } else {
          _this[objKey][_obj.modelName] = len === 2 ? arr : time
        }
      }
    }
    if (_this && _this._isVue) {
      const $this = $($(el).children('input')[0])
      const $this2 = $($(el).children('input')[1])
      // 判断是范围的还是单个独立的日期时间控件，范围的两个输入框都要绑定change事件
      if ($(el).children('input').length > 1) {
        $this.on('change', function() {
          const value = $this.val()
          modelValue(value, 2)
        })
        $this2.on('change', function() {
          const value = $this2.val()
          modelValue(value, 2)
        })
      } else {
        $this.on('change', function() {
          const value = $this.val()
          modelValue(value, 1)
        })
      }
    }
  }
})

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
