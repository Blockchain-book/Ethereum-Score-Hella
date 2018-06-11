const utils = require('./utils')
module.exports = {
  newCustomer: function (ScoreInstance, account) {
    const address = document.getElementById('customerAddress').value
    const password = document.getElementById('customerPassword').value
    console.log(address + ' ' + password)
    ScoreInstance.newCustomer(address, password, { from: account, gas: 3000000 }).then(function () {
      ScoreInstance.NewCustomer(function (e, r) {
        if (!e) {
          console.log(r)
          console.log(r.args)
          if (r.args.isSuccess === true) {
            window.App.setStatus('注册成功')
            setTimeout(function () {
              window.App.setStatus('')
            }, 3000)
            window.App.setConsole('注册成功')
          } else {
            window.App.setStatus('账户已经注册')
            setTimeout(function () {
              window.App.setStatus('')
            }, 3000)
            window.App.setConsole('账户已经注册')
          }
        } else {
          console.log(e)
        }
      })
    })
  },
  customerLogin: function (ScoreInstance, account) {
    const address = document.getElementById('customerLoginAddr').value
    const password = document.getElementById('customerLoginPwd').value

    ScoreInstance.getCustomerPassword(address, { from: account, gas: 3000000 }).then(function (result) {
      if (result[0]) {
        // 查询密码成功
        if (password.localeCompare(utils.hexCharCodeToStr(result[1])) === 0) {
          console.log('登录成功')
          // 跳转到用户界面
          window.location.href = 'customer.html?account=' + address
        } else {
          console.log('密码错误，登录失败')
          window.alert('密码错误，登录失败')
        }
      } else {
        // 查询密码失败
        console.log('该用户不存在，请确定账号后再登录！')
        window.alert('该用户不存在，请确定账号后再登录！')
      }
    })
  }
}
