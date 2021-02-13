export default class SocketService {
  /**
   * 单例
   */
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null
  // 存储回到函数
  callBackMapping = {}
	// 用于表示是否连接成功
	connected = false
	// 用于记录发送不成功，而重新发送的的次数
	sendRetryCount = 0
	// 重新连接尝试的次数
	connectRetryCount = 0
  // 定义连接服务器的方法
  connect() {
    // 连接服务器
    if (!window.WebSocket) return console.log('您的浏览器不支持 WebSocket');

    // this.ws = new WebSocket('ws://localhost:9998')

    // 使用接口地址
    this.ws = new WebSocket('ws://localhost:9998')


    // 连接成功的事件
    this.ws.onopen = () => {
			this.connected = true
      console.log('连接服务端成功了');
    }

    // 接收到服务端数据
    this.ws.onmessage = (msg) => {
      // 保存接收到的数据
      const recvData = JSON.parse(msg.data)
      // console.log('接收到数据：',recvData);
      // 取出业务模块类型
      const socketType = recvData.socketType
      // 判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          // 获取数据  realData真实数据
          const realData = JSON.parse(recvData.data)
          // console.log('真实数据：',realData);
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          // 全屏事件
          this.callBackMapping[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          // 主题切换
          this.callBackMapping[socketType].call(this, recvData)
        }
      }

    }

    // 连接服务端失败
    this.ws.onerror = () => {
			// 每当连接成功的时候，connectRetryCount置0
			this.connectRetryCount = 0
      console.log('连接服务端失败');
    }

    // 连接已关闭  当连接成功后:服务器关闭
    this.ws.onclose = () => {
			// 每当连接失败的时候，connectRetryCount加1
			this.connectRetryCount++
			this.connected = false
      console.log('连接已关闭');
			// 失败之后重连，随着重连次数的增加，时间间隔也增加
			setTimeout(() => {
				this.connect()
			}, 500 * this.connectRetryCount)
    }
  }

  /**
   * 注册回调函数
   * @param {socketType} 业务模块类型 
   * @param {*} callback 
   */
  registerCallBack(socketType, callback) {
    this.callBackMapping[socketType] = callback
  }

  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  // 发送数据的方法
	send(data){
		// 判断此时有没有连接成功
		if( this.connected ){
			this.sendRetryCount = 0
			this.ws.send(JSON.stringify(data))	
		}else{
			setTimeout(() => {
				// 每次发送不成功的情况下，sendRetryCount要加1
				this.sendRetryCount++
				this.send(data)
			},500)
		}
	}
}