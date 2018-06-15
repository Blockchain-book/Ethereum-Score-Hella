const utils = require('./utils')
module.exports = {

  // 注册商家
  newMerchant: function (ScoreInstance, account) {
    const address = document.getElementById('merchantAddress').value
    const password = document.getElementById('merchantPassword').value
    ScoreInstance.newMerchant(address, password, { from: account, gas: 1000000 }).then(function () {
      ScoreInstance.NewMerchant(function (error, event) {
        if (!error) {
          console.log(event.args.message)
          window.App.setStatus(event.args.message)
        }
      })
    })
  },
  // 商家登录
  merchantLogin: function (ScoreInstance, account) {
    const address = document.getElementById('merchantLoginAddr').value
    const password = document.getElementById('merchantLoginPwd').value
    ScoreInstance.getMerchantPassword(address, { from: account }).then(function (result) {
      console.log(password)
      console.log(utils.hexCharCodeToStr(result[1]))
      if (result[0]) {
        // 查询密码成功
        if (password.localeCompare(utils.hexCharCodeToStr(result[1])) === 0) {
          console.log('登录成功')
          // 跳转到商户界面
          window.location.href = 'merchant.html?account=' + address
        } else {
          console.log('密码错误,登录失败')
          window.App.setStatus('密码错误，登录失败')
        }
      } else {
        // 查询密码失败
        console.log('该商户不存在，请确定账号后再登录！')
        window.App.setStatus('该商户不存在，请确定账号后再登录！')
      }
    })
  },
  // 根据商户address获取积分余额
  getScoreWithMerchantAddr: function (currentAccount, ScoreInstance, account) {
    console.log(currentAccount)
    ScoreInstance.getScoreWithMerchantAddr.call(currentAccount, { from: account }).then(function (value) {
      window.App.setStatus('当前余额：' + value.valueOf())
    }).catch(function (e) {
      console.log(e)
      window.App.setStatus('出现异常，查询余额失败！')
    })
  },
  getCurrentMerchant: function (currentAccount) {
    window.App.setStatus(currentAccount)
  },
  // 商户实现任意的积分转让
  transferScoreToAnotherFromMerchant: function (currentAccount, ScoreInstance, account) {
    const receivedAddr = document.getElementById('anotherAccountAddr').value
    const amount = parseInt(document.getElementById('scoreAmount').value)
    ScoreInstance.transferScoreToAnother(1, currentAccount, receivedAddr, amount, { from: account })
    ScoreInstance.TransferScoreToAnother(function (error, event) {
      if (!error) {
        console.log(event.args.message)
        window.App.setStatus(event.args.message)
      }
    })
  },
  // 商户增加一件商品：默认gas会OOG
  addGood: function (currentAccount, ScoreInstance, account) {
    const goodId = document.getElementById('goodId').value
    const goodPrice = parseInt(document.getElementById('goodPrice').value)
    ScoreInstance.addGood(currentAccount, goodId, goodPrice, { from: account, gas: 2000000 }).then(function () {
      ScoreInstance.AddGood(function (error, event) {
        if (!error) {
          console.log(event.args.message)
          window.App.setStatus(event.args.message)
        }
      })
    })
  },
  // 商户查看已添加的所有商品
  getGoodsByMerchant: function (currentAccount, ScoreInstance, account) {
    ScoreInstance.getGoodsByMerchant.call(currentAccount, { from: account }).then(function (result) {
      console.log(result.length)
      console.log(result)
      if (result.length === 0) {
        window.App.setStatus('空...')
      }
      let allGoods = ''
      result.forEach(e => {
        allGoods += utils.hexCharCodeToStr(e) + ', '
      })
      allGoods = allGoods.substr(0, allGoods.length - 2)
      window.App.setStatus(allGoods)
    })
  },
  // 商户和银行进行积分清算
  settleScoreWithBank: function (currentAccount, ScoreInstance, account) {
    const settleAmount = parseInt(document.getElementById('settleAmount').value)
    ScoreInstance.settleScoreWithBank(currentAccount, settleAmount, { from: account }).then(function () {
      ScoreInstance.SettleScoreWithBank(function (error, event) {
        if (!error) {
          console.log(event.args.message)
          window.App.setStatus(event.args.message)
        } else {
          console.log('清算积分失败', error)
          window.App.setStatus('清算积分失败')
        }
      })
    })
  }
}

