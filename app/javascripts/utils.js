/**
 * Created by chenyufeng on 12/24/16.
 */
// 十六进制转化为字符串
module.exports = {
  hexCharCodeToStr: function (hexCharCodeStr) {
    const trimedStr = hexCharCodeStr.trim()
    const rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr
    const len = rawStr.length
    if (len % 2 !== 0) {
      window.alert(' Illegal Format ASCII Code!')
      return ''
    }
    let curCharCode
    const resultStr = []
    for (let i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16) // ASCII Code Value
      resultStr.push(String.fromCharCode(curCharCode))
    }
    return resultStr.join('')
  }
}
