//根据商户address获取积分余额
function getScoreWithMerchantAddr() {
    console.log(currentAccount);
    contractAddr.getScoreWithMerchantAddr.call(currentAccount, {from: account}).then(function(value) {
        alert("当前余额：" + value.valueOf());
    }).catch(function(e) {
        console.log(e);
        alert("出现异常，查询余额失败！");
    });
}

function getCurrentMerchant() {
    alert(currentAccount);
}

//商户实现任意的积分转让
function transferScoreToAnotherFromMerchant() {
    var receivedAddr = document.getElementById("anotherAccountAddr").value;
    var amount = parseInt(document.getElementById("scoreAmount").value);
    contractAddr.transferScoreToAnother(1, currentAccount, receivedAddr, amount, {from: account});
    var eventTransferScoreToAnother = contractAddr.TransferScoreToAnother();
    eventTransferScoreToAnother.watch(function (error, event) {
        console.log(event.args.message);
        alert(event.args.message);

        eventTransferScoreToAnother.stopWatching();
    });
}

//商户增加一件商品：默认gas会OOG
function addGood() {
    var goodId = document.getElementById("goodId").value;
    var goodPrice = parseInt(document.getElementById("goodPrice").value);
    contractAddr.addGood(currentAccount, goodId, goodPrice, {from: account, gas: 2000000}).then(function () {
        var eventAddGood = contractAddr.AddGood();
        eventAddGood.watch(function (error, event) {
            console.log(event.args.message);
            alert(event.args.message);
            eventAddGood.stopWatching();
        });
    });
}

//商户查看已添加的所有商品
function getGoodsByMerchant() {
    contractAddr.getGoodsByMerchant.call(currentAccount, {from: account}).then(function (result) {
        console.log(result.length);
        console.log(result);

        for (var i = 0; i < result.length; i++){
            var temp = hexCharCodeToStr(result[i]).toString();
            console.log(temp);
        }
    });
}

//商户和银行进行积分清算
function settleScoreWithBank() {
    var settleAmount = parseInt(document.getElementById("settleAmount").value);
    contractAddr.settleScoreWithBank(currentAccount, settleAmount, {from: account}).then(function() {
        var eventSettleScoreWithBank = contractAddr.SettleScoreWithBank();
        eventSettleScoreWithBank.watch(function (error, event) {
            console.log(event.args.message);
            alert(event.args.message);
            eventSettleScoreWithBank.stopWatching();
        });
    }).catch(function(e) {
        console.log(e);
        setStatus("清算积分失败");
    });
}