import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/css/global.less'
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket_service.js'
// 对服务端进行websocket连接
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance
// axios 配置接口默认路径
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'

// 把echarts挂载到 Vue原型上，以便在全局访问
Vue.prototype.$echarts = window.echarts
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
