// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'
const test = require('./test.js')
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ScoreArtifacts from '../../build/contracts/Score'

// MetaCoin is our usable abstraction, which we'll use through the code below.
let ScoreContract = contract(ScoreArtifacts)
let ScoreInstance
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

window.App = {
  init: function () {
    // 设置web3连接
    ScoreContract.setProvider(window.web3.currentProvider)
    // Get the initial account balance so it can be displayed.
    window.web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        window.alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        window.alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.')
        return
      }
      accounts = accs
      account = accounts[0]
    })

    ScoreContract.deployed().then(function (instance) {
      ScoreInstance = instance
    }).catch(function (e) {
      console.log(e, null)
    })
  },
  // 新建客户
  newCustomer: function () {
    const address = document.getElementById('customerAddress').value
    const password = document.getElementById('customerPassword').value
    console.log(address + ' ' + password)
    test.hello()
    ScoreInstance.newCustomer(address, password, { from: account, gas: 3000000 }).then(function () {
      ScoreInstance.NewCustomer(function (e, r) {
        if (!e) {
          console.log(r)
          console.log(r.args)
          if (r.args.isSuccess === true) {
            this.setStatus('注册成功')
            console.log('注册成功')
          } else {
            this.setStatus('账户已经注册')
            console.log('账户已经注册')
          }
        } else {
          console.log(e)
        }
      })
    })
  },
  getCustomerPassword:function () {
    console.log(ScoreInstance.getCustomerPassword(account, { from: account }))
  },
  isLogin:function () {
    const address = document.getElementById('customerAddress').value
    console.log(ScoreInstance.isMerchantAlreadyRegister(address, { from: account }))
  },
  setStatus: function (message) {
    var status = document.getElementById('status')
    status.innerHTML = message
  },

  // 查询所有的用户
  info: function () {
    console.log(window.web3.eth.accounts)
  },
  print: function () {
    ScoreInstance.print(account, { from: account }).then(function () {
      // event
      ScoreInstance.Test(function (error, result) {
        if (!error) {
          console.log(result.args)
        }
      })
    })
  },
  getGreet:function () {
    console.log(ScoreInstance.getGreet({ from:account }))
  },
  setGreet:function () {
    ScoreInstance.setGreet('ll', { from:account }).then(function () {
      ScoreInstance.SetGreet(function (e, r) {
        if (!e) {
          console.log(r)
        }
      })
    })
  }
}

window.addEventListener('load', function () {
  // 设置web3连接 http://127.0.0.1:8545
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  window.App.init()
})
