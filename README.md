# Ethereum-Score-Hella

## 环境准备

### 当前系统版本

go: go version go1.10.2 darwin/amd64

npm: 6.1.0

node: v10.3.0

Homebrew :1.6.6    Homebrew/homebrew-core (git revision 70de; last commit 2018-06-04)

Truffle v4.1.11 (core: 4.1.11)
Solidity v0.4.24 (solc-js) // Truffle 自带

geth： 1.8.10-stable

ganache:Ganache CLI v6.1.0 (ganache-core: 2.1.0)

python：Python 2.7.10 (default, Oct  6 2017, 22:29:07)

### 环境安装

#### Golang

mac os

https://golang.org/dl/

cenos 

```
yum install golang
```

#### Geth

用于建立私有链，在真实环境中使用，在开发环境中可以选用ganache或者truffle提供的虚拟环境。

mac os

```
brew update

brew upgrade

brew tap ethereum/ethereum

brew install ethereum

geth version //进行验证
```

centos

```
git clone https://github.com/ethereum/go-ethereum
cd go-ethereum
make geth
build/bin/geth
```

注意需要找到bin目录运行geth

#### ganache

即testRpc，提供的虚拟以太坊环境，用于开发测试。

由于geth挖矿耗费cpu使用ganache会比较简单。

```
npm install -g ganache-cli
```

```
运行
ganache-cli
```
##### 连接到运行的ganache 
由于ganache-cli是不带可交互的输入的，并且无法输入日志，这里与geth相同可以用geth attach连入。
```
geth attach http://localhost:8545
```
#### truffle

是一个以太坊开发框架，提供合约编译,合约部署，虚拟环境等功能。

本文是基于truffle开展的。

truffle自带了编译器（solc-js），使用truffle compile命令,使用truffle version命令查看。

##### truffle安装

```
npm install -g truffle
```

## 项目开始

```
//自动下载并构建项目
truffle unbox webpack
```

### 项目结构

```bash
├── app/
│   ├── bank.html
│   ├── customer.html
│   ├── index.html
│   ├── javascripts/
│   │   ├── app.js
│   │   ├── bank.js
│   │   ├── customer.js
│   │   ├── merchant.js
│   │   └── utils.js
│   ├── merchant.html
│   └── stylesheets/
│       └── app.css
├── contracts/
│   ├── Migrations.sol
│   └── Score.sol
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── package-lock.json
├── package.json
├── test/
│   ├── TestMetacoin.sol
│   └── metacoin.js
├── truffle.js
└── webpack.config.js
```


## 合约代码迁移

### Solidity代码更新

原先的solidity代码无法在当前编译器下进行编译，需要进行修改。

#### Remix在线环境

在线调试环境可以进行compile deploy invoke等操作，能够提高效率。

https://remix.ethereum.org/

### 将合约代码加入到项目中

合约文件（*.sol）需要放置在contracts文件夹中。

并修改2_deploy_contracts.js,该文件用于部署合约，注意1_initial_migration.js文件与Migration.sol对应不需要修改。

```js
var Score = artifacts.require("./Score.sol");
module.exports = function(deployer) {
  deployer.deploy(Score);
};
```

**注意：**不能删除Migration.sol，该文件在部署合约时需要使用。

## 合约编译

### truffle compile 

```
truffle compile 会编译相关合约
truffle compile --compile-all //重新编译所有
```

## 合约部署

### Geth（建立私有链,然后部署）

如果使用Ganache-cli 或者 truffle develop，可以跳过该部分。

Geth能够建立私有链网络。但是需要开启挖矿，消耗CPU。一旦关闭挖矿，则无法进行合约部署和带有交易的合约操作。

#### 安装geth

mac os

```
brew update

brew upgrade

brew tap ethereum/ethereum

brew install ethereum

geth version //进行验证
```

centos

```
git clone https://github.com/ethereum/go-ethereum
cd go-ethereum
make geth
build/bin/geth
```

注意需要找到bin目录运行geth

#### 编写genesis.json文件

```json
{
    "config": {
        "chainId": 15,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "difficulty": "1",
    "gasLimit": "210",
    "alloc": {
    }
}
```

#### 生成创世区块

```
geth --datadir ~/Geth/data/tmp3 init ~/Geth/genesis.json
```

#### console形式启动

```
geth --datadir ~/Geth/data/tmp console 2>> ~/Geth/data/tmp3/tmp3.log
```

##### 生成账户

```
personal.newAccount("123456")
"0x4c2e1e2df0626e2a56e543cfd4d366c739ca94a0"
```

##### 开启挖矿

```
> miner.setEtherbase(eth.accounts[0])
true
> miner.start()
null
> eth.blockNumber
0
> eth.blockNumber
1
> eth.blockNumber
```

**注意：**genesis.json中的difficulty不可设置太大，否则可能导致一直无法出现新的区块。

##### 账户解锁

在部署合约或者调用合约（写区块操作）时，需要解锁账户（coinbase账户），在本系统中，使用coinbase账户进行调用合约。

```
personal.unlockAccount("0x318a1986cffc2ea7b39eb1375f41bead79ce58f3","123456")
```

#### console相关启动参数解释

--rpc: 运行rpc调用

--rpcapi：运行的rpc类型 value（personal,db,eth,net,web3）

--rpccorsdomain：允许跨域 value（“*”，表示所有的都允许）

```
geth --datadir ~/Geth/data/tmp --rpc console 2>> ~/Geth/data/tmp3/tmp3.log

geth --datadir ~/Geth/data/tmp1 --rpcapi personal,db,eth,net,web3 --rpc  console 2>> ~/Geth/data/tmp1/tmp1.log  

geth --datadir ~/Geth/data/tmp1 --rpcapi personal,db,eth,net,web3 --rpc --rpccorsdomain "" console 2>> ~/Geth/data/tmp1/tmp1.log  //能够被web3访问到
```

#### 部署时遇到的问题

```
truffle migrate //部署
truffle migrate --reset //全部重新部署
```

##### 问题1 Error:authentication needed: password or unlock

###### 对账户进行解锁

```
personal.unlockAccount("0x318a1986cffc2ea7b39eb1375f41bead79ce58f3")
输入密码
```

##### 问题2 Error:excceds block gas limit

这是gasLimit设置太小

###### 修改genesis文件，并重新运行一个节点

```json
{
    "config": {
        "chainId": 15,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "difficulty": "1",
    "gasLimit": "200000000000",
    "alloc": {
    }
}
```



##### 问题3 Error: insufficient funds for gas * price + value

这可能是由于未开启挖矿

### Ganache-cli 和 truffle develop

直接运行
ganache-cli 
或者

truffle develop

truffle develop，在虚拟区块链网络的同时提供了命令行交互。

#### 部署

```
truffle migrate //部署
truffle migrate --reset //全部重新部署
```



## 合约调用

### Truffle console-命令行交互

开启truffle console会连接truffle.js设置的网络。

在写入时需要保证账户解锁且开启挖矿。

#### 调用合约（truffle console）

```

truffle(development)> Greeter.deployed().then(function(e){e.greet().then(function(r){console.log(r)})})
truffle(development)> 0101
truffle(development)> Greeter.deployed().then(function(e){e.setGreeting("hello!").then(function(r){console.log(r)})})
truffle(development)> { ... 交易信息... }
truffle(development)> Greeter.deployed().then(function(e){e.greet().then(function(r){console.log(r)})})
truffle(development)> hello!
```

### Web3.js 调用 

使Node JS对外提供服务，并调用

简单封装一下调用合约的函数

```java
var Web3 = require("web3");
//创建web3对象
var web3 = new Web3();
// 连接到以太坊节点
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));
console.log("....");
var version = web3.version.node;
console.log(version);
//当前的合约调用账号
web3.eth.defaultAccount = web3.eth.coinbase;
var account_one = web3.eth.accounts[0];
var abi =  [...从合约编译出的json文件中copy];
//合约地址
var address = "0x92a207c402d52e65a62facebf31dd82ab34ff1ac";
var greeter = web3.eth.contract(abi).at(address);
module.exports={
  get:function(){
    console.log("Greeter:get() ...");
    return greeter.greet.call();
  },
  set:function(info){
    console.log("Greeter:set(info) ...");
    greeter.setGreeting(info)
  }
}
```

简单的测试接口

```javascript
var http = require('http');
var url = require('url');
var util = require('util');

var greeter = require('./GreeterRpc.js');

http.createServer(function(req, res){
    console.log(greeter.set(Math.random().toString(36).substr(2)));
    console.log(greeter.get());
}).listen(3000);

```

## Dapp应用构建

### truffle.js配置

#### 配置网络

```javascript
// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    truffle: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    develop: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
```

#### 选择网络

```
truffle migrate --network develop --reset
```

### webpack.config.js配置

#### html资源配置

不进行配置，则无法进行访问。

```javascript
 plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' }
    ]),
    new CopyWebpackPlugin([
      { from: './app/customer.html', to: 'customer.html' }
    ]),
    new CopyWebpackPlugin([
      { from: './app/bank.html', to: 'bank.html' }
    ]),
    new CopyWebpackPlugin([
      { from: './app/merchant.html', to: 'merchant.html' }
    ])
  ]
```

### web3Js

提供调用合约的方法。

#### 获取合约实例

在获取实例时，需要

##### 获取编译后的artifacts，里面有abi（对合约函数进行了描述）

```
// Import our contract artifacts and turn them into usable abstractions.
import ScoreArtifacts from '../../build/contracts/Score'
```

```js
  // 获得合约实例
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
     //在这里获取实例
    ScoreContract.deployed().then(function (instance) {
      ScoreInstance = instance
    }).catch(function (e) {
      console.log(e, null)
    })
  }
```



#### 合约调用

通过ScoreInstance这个合约实例进行调用。

```js
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
  },
```

##### 注意点

需要传入gas，否者会出现out of gas

 { from: account, gas: 3000000 }     // from是指合约调用者。

#### event监听

```js
 ScoreInstance.BuyGood(function (error, event) {
        if (!error) {
          console.log(event.args.message)  // event是指事件emit出来的内容
          window.App.setStatus(event.args.message)
        }
      })
```



## 可能的问题

### 设置跨域(使用Geth)

geth网络，由于不同域，无法访问。

#### 解决办法

```
--rpc --rpccorsdomain "*"

geth --datadir ~/Geth/data/tmp1 --rpcapi personal,db,eth,net,web3 --rpc --rpccorsdomain "*" console 2>> ~/Geth/data/tmp1/tmp1.log  //能够被web3访问到
```

### 在ganache-cli和truffle develop 中 Out of gas 

#### 调用时传入gas

```javascript
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
```

### Utils中的函数在geth环境中与remix中运行情况不同，在geth存在问题（未解决）

#### 在ganache-cli和truffle develop中都可以正常调用

//这行代码在geth环境下有问题

customer[_customerAddr].password = stringToBytes32(_password);

```js
function newCustomer(address _customerAddr, string _password) public {
        //判断是否已经注册
        if (!isCustomerAlreadyRegister(_customerAddr)) {
            //还未注册
            customer[_customerAddr].customerAddr = _customerAddr;
            //这行代码在geth环境下有问题
            customer[_customerAddr].password = stringToBytes32(_password);
            customers.push(_customerAddr);
            emit NewCustomer(msg.sender, true, _password);
            return;
        }
        else {
            emit NewCustomer(msg.sender, false, _password);
            return;
        }
}
```

### 配置和选择网络

```javascript
// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    truffle: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    develop: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
```

#### 网络选择

```
truffle migrate --network develop --reset
```

### 无法跳转页面 cannot GET/customer.html

由于是使用webpack

在webpack.config.js中配置,并重新运行 npm run dev

```javascript
 plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' }
    ]),
    new CopyWebpackPlugin([
      { from: './app/customer.html', to: 'customer.html' }
    ])
  ],
```

#### html如何使用js文件

引入<script src="./app.js"></script>，这个入口文件即可。不需要使用绝对的路径，对于前端不熟，有待了解。

## 常用命令

```
truffle compile --compile-all //重新编译所有
truffle migrate --reset //重新部署所有
truffle migrate --network develop --reset //选择truffle.js中的网络配置
npm run dev //运行前端页面

```

## 快速使用

### 环境安装

至少安装以下环境

npm 
truffle

```
git clone https://github.com/Blockchain-book/Ethereum-Score-Hella.git
npm install
truffle develop //开启环境
truffle compile //编译
truffle migrate --network truffle  //部署
npm run dev
```

