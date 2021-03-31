const app = getApp()
Page({
  data: {
    inputText: 'Hello World!',
    receiveText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)
  },
  Send: function () {
    var that = this
    if (that.data.connected) {
      var buffer = new ArrayBuffer(that.data.inputText.length)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i < that.data.inputText.length; i++) {
        dataView[i] = that.data.inputText.charCodeAt(i)
      }

      console.log("deviceId: ", that.data.connectedDeviceId)
      console.log("serviceId: ", that.data.services[0].uuid)
      let writeCharacteristic = that.getWriteCharacteristics()
      if(writeCharacteristic){
        console.log("characteristicId: ", writeCharacteristic.uuid)
        wx.writeBLECharacteristicValue({
          deviceId: that.data.connectedDeviceId,
          serviceId: that.data.services[0].uuid,
          characteristicId: writeCharacteristic.uuid,
          value: buffer,
          success: function (res) {
            console.log('发送成功')
          },
          fail: function(error){
            console.error("异常情况：", error)
          }
        })
      }
      let readCharacteristic = that.getReadCharacteristics()
      if(readCharacteristic){
        wx.readBLECharacteristicValue({
          deviceId: that.data.connectedDeviceId,
          serviceId: that.data.services[0].uuid,
          characteristicId: readCharacteristic.uuid,
          success (res) {
            console.log('readBLECharacteristicValue:', res.errCode)
          }
        })
      }
    }
    else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  getWriteCharacteristics: function(){
    let characteristics = this.data.characteristics
    for (let i = 0; i < characteristics.length; i++) {
      const element = characteristics[i]
      let properties = element.properties
      if(properties.write){
        return element
      }
    }
    return null
  },
  getReadCharacteristics: function(){
    let characteristics = this.data.characteristics
    for (let i = 0; i < characteristics.length; i++) {
      const element = characteristics[i]
      let properties = element.properties
      if(properties.read){
        return element
      }
    }
    return null
  },
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.services)
        that.setData({
          services: res.services
        })
        // 获取蓝牙设备某个服务中所有特征值(characteristic)
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[0].uuid,
          success: function (res) {
            console.log("获取蓝牙设备某个服务中所有特征值: ", res.characteristics)
            that.setData({
              characteristics: res.characteristics
            })
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: options.connectedDeviceId,
              serviceId: that.data.services[0].uuid,
              characteristicId: that.data.characteristics[0].uuid,
              success: function (res) {
                console.log('启用notify成功')
              },
              fail: function(error){
                console.error('异常情况', error)
              }
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })
    wx.onBLECharacteristicValueChange(function (res) {
      var receiveText = app.buf2string(res.value)
      console.log('接收到数据：' + receiveText)
      that.setData({
        receiveText: receiveText
      })
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  }
})