module.exports = {

  bankLogin:function (ScoreInstance, account) {
    const address = document.getElementById('bankLoginAddr').value
    ScoreInstance.getOwner({ from: account }).then(function (result) {
      if (address.localeCompare(result) === 0) {
        // 跳转到管理员页面
        window.location.href = 'bank.html?account=' + address
      } else {
        window.alert('不是银行账户，登录失败')
      }
    })
  },
  sendScoreToCustomer: function (ScoreInstance, account) {
    const address = document.getElementById('customerAddress').value
    const score = document.getElementById('scoreAmount').value
    ScoreInstance.sendScoreToCustomer(address, score, { from: account })
    ScoreInstance.SendScoreToCustomer(function (e, r) {
      if (!e) {
        console.log(r.args.message)
        window.App.setStatus(r.args.message)
      }
    })
  },

  getIssuedScoreAmount: function (ScoreInstance, account) {
    ScoreInstance.getIssuedScoreAmount({ from: account }).then(function (result) {
      window.alert('已发行的积分总数为：' + result)
    })
  },

  getSettledScoreAmount: function (ScoreInstance, account) {
    ScoreInstance.getSettledScoreAmount({ from: account }).then(function (result) {
      window.alert('已清算的积分总数为：' + result)
    })
  }
}
