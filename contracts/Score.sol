pragma solidity ^0.4.24;

contract Utils {

    function stringToBytes32(string memory source)  internal pure  returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToString(bytes32 x)  internal pure  returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
}

contract Score is Utils {


    address owner; //合约的拥有者，银行
    uint issuedScoreAmount; //银行已经发行的积分总数
    uint settledScoreAmount; //银行已经清算的积分总数

    struct Customer {
        address customerAddr; //客户address
        bytes32 password; //客户密码
        uint scoreAmount; //积分余额
        bytes32[] buyGoods; //购买的商品数组
    }

    struct Merchant {
        address merchantAddr; //商户address
        bytes32 password; //商户密码
        uint scoreAmount; //积分余额
        bytes32[] sellGoods; //发布的商品数组
    }

    struct Good {
        bytes32 goodId; //商品Id;
        uint price; //价格；
        address belong; //商品属于哪个商户address；
    }


    mapping(address => Customer) customer;
    mapping(address => Merchant) merchant;
    mapping(bytes32 => Good) good; //根据商品Id查找该件商品

    address[] customers; //已注册的客户数组
    address[] merchants; //已注册的商户数组
    bytes32[] goods; //已经上线的商品数组

    //增加权限控制，某些方法只能由合约的创建者调用
    modifier onlyOwner(){
        if (msg.sender == owner) _;
    }

    //构造函数
    constructor() public {
        owner = msg.sender;
    }


    //返回合约调用者地址
    function getOwner() constant public  returns (address) {
        return owner;
    }

    //注册一个客户
    event NewCustomer(address sender, bool isSuccess, string password);

    function newCustomer(address _customerAddr, string _password) public {
        //判断是否已经注册
        if (!isCustomerAlreadyRegister(_customerAddr)) {
            //还未注册
            customer[_customerAddr].customerAddr = _customerAddr;
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

    //注册一个商户
    event NewMerchant(address sender, bool isSuccess, string message);

    function newMerchant(address _merchantAddr,
        string _password) public {

        //判断是否已经注册
        if (!isMerchantAlreadyRegister(_merchantAddr)) {
            //还未注册
            merchant[_merchantAddr].merchantAddr = _merchantAddr;
            merchant[_merchantAddr].password = stringToBytes32(_password);
            merchants.push(_merchantAddr);
            emit NewMerchant(msg.sender, true, "注册成功");
            return;
        }
        else {
            emit NewMerchant(msg.sender, false, "该账户已经注册");
            return;
        }
    }

    //判断一个客户是否已经注册
    function isCustomerAlreadyRegister(address _customerAddr) internal view returns (bool)  {
        for (uint i = 0; i < customers.length; i++) {
            if (customers[i] == _customerAddr) {
                return true;
            }
        }
        return false;
    }

    //判断一个商户是否已经注册
    function isMerchantAlreadyRegister(address _merchantAddr) public view returns (bool) {
        for (uint i = 0; i < merchants.length; i++) {
            if (merchants[i] == _merchantAddr) {
                return true;
            }
        }
        return false;
    }

    //查询用户密码
    function getCustomerPassword(address _customerAddr) constant public returns (bool, bytes32) {
        //先判断该用户是否注册
        if (isCustomerAlreadyRegister(_customerAddr)) {
            return (true, customer[_customerAddr].password);
        }
        else {
            return (false, "");
        }
    }

    //查询商户密码
    function getMerchantPassword(address _merchantAddr) constant public returns (bool, bytes32) {
        //先判断该商户是否注册
        if (isMerchantAlreadyRegister(_merchantAddr)) {
            return (true, merchant[_merchantAddr].password);
        }
        else {
            return (false, "");
        }
    }

    //银行发送积分给客户,只能被银行调用，且只能发送给客户
    event SendScoreToCustomer(address sender, string message);

    function sendScoreToCustomer(address _receiver,
        uint _amount) onlyOwner public {

        if (isCustomerAlreadyRegister(_receiver)) {
            //已经注册
            issuedScoreAmount += _amount;
            customer[_receiver].scoreAmount += _amount;
            emit SendScoreToCustomer(msg.sender, "发行积分成功");
            return;
        }
        else {
            //还没注册
            emit SendScoreToCustomer(msg.sender, "该账户未注册，发行积分失败");
            return;
        }
    }

    //根据客户address查找余额
    function getScoreWithCustomerAddr(address customerAddr) constant public returns (uint) {
        return customer[customerAddr].scoreAmount;
    }

    //根据商户address查找余额
    function getScoreWithMerchantAddr(address merchantAddr) constant public returns (uint) {
        return merchant[merchantAddr].scoreAmount;
    }

    //两个账户转移积分，任意两个账户之间都可以转移，客户商户都调用该方法
    //_senderType表示调用者类型，0表示客户，1表示商户
    event TransferScoreToAnother(address sender, string message);

    function transferScoreToAnother(uint _senderType,
        address _sender,
        address _receiver,
        uint _amount) public {

        if (!isCustomerAlreadyRegister(_receiver) && !isMerchantAlreadyRegister(_receiver)) {
            //目的账户不存在
            emit TransferScoreToAnother(msg.sender, "目的账户不存在，请确认后再转移！");
            return;
        }
        if (_senderType == 0) {
            //客户转移
            if (customer[_sender].scoreAmount >= _amount) {
                customer[_sender].scoreAmount -= _amount;

                if (isCustomerAlreadyRegister(_receiver)) {
                    //目的地址是客户
                    customer[_receiver].scoreAmount += _amount;
                } else {
                    merchant[_receiver].scoreAmount += _amount;
                }
                emit TransferScoreToAnother(msg.sender, "积分转让成功！");
                return;
            } else {
                emit TransferScoreToAnother(msg.sender, "你的积分余额不足，转让失败！");
                return;
            }
        } else {
            //商户转移
            if (merchant[_sender].scoreAmount >= _amount) {
                merchant[_sender].scoreAmount -= _amount;
                if (isCustomerAlreadyRegister(_receiver)) {
                    //目的地址是客户
                    customer[_receiver].scoreAmount += _amount;
                } else {
                    merchant[_receiver].scoreAmount += _amount;
                }
                emit TransferScoreToAnother(msg.sender, "积分转让成功！");
                return;
            } else {
                emit TransferScoreToAnother(msg.sender, "你的积分余额不足，转让失败！");
                return;
            }
        }
    }

    //银行查找已经发行的积分总数
    function getIssuedScoreAmount() constant public returns (uint) {
        return issuedScoreAmount;
    }

    //银行查找已经清算的积分总数
    function getSettledScoreAmount() constant public returns (uint) {
        return settledScoreAmount;
    }

    //商户添加一件商品
    event AddGood(address sender, bool isSuccess, string message);

    function addGood(address _merchantAddr, string _goodId, uint _price) public {
        bytes32 tempId = stringToBytes32(_goodId);

        //首先判断该商品Id是否已经存在
        if (!isGoodAlreadyAdd(tempId)) {
            good[tempId].goodId = tempId;
            good[tempId].price = _price;
            good[tempId].belong = _merchantAddr;

            goods.push(tempId);
            merchant[_merchantAddr].sellGoods.push(tempId);
            emit AddGood(msg.sender, true, "创建商品成功");
            return;
        }
        else {
            emit AddGood(msg.sender, false, "该件商品已经添加，请确认后操作");
            return;
        }
    }

    //商户查找自己的商品数组
    function getGoodsByMerchant(address _merchantAddr) constant public returns (bytes32[]) {
        return merchant[_merchantAddr].sellGoods;
    }

    //用户用积分购买一件商品
    event BuyGood(address sender, bool isSuccess, string message);

    function buyGood(address _customerAddr, string _goodId) public {
        //首先判断输入的商品Id是否存在
        bytes32 tempId = stringToBytes32(_goodId);
        if (isGoodAlreadyAdd(tempId)) {
            //该件商品已经添加，可以购买
            if (customer[_customerAddr].scoreAmount < good[tempId].price) {
                emit BuyGood(msg.sender, false, "余额不足，购买商品失败");
                return;
            }
            else {
                //对这里的方法抽取
                customer[_customerAddr].scoreAmount -= good[tempId].price;
                merchant[good[tempId].belong].scoreAmount += good[tempId].price;
                customer[_customerAddr].buyGoods.push(tempId);
                emit BuyGood(msg.sender, true, "购买商品成功");
                return;
            }
        }
        else {
            //没有这个Id的商品
            emit BuyGood(msg.sender, false, "输入商品Id不存在，请确定后购买");
            return;
        }
    }

    //客户查找自己的商品数组
    function getGoodsByCustomer(address _customerAddr) constant public returns (bytes32[]) {
        return customer[_customerAddr].buyGoods;
    }

    //首先判断输入的商品Id是否存在
    function isGoodAlreadyAdd(bytes32 _goodId) internal view returns (bool) {
        for (uint i = 0; i < goods.length; i++) {
            if (goods[i] == _goodId) {
                return true;
            }
        }
        return false;
    }

    //商户和银行清算积分
    event SettleScoreWithBank(address sender, string message);

    function settleScoreWithBank(address _merchantAddr, uint _amount) public {
        if (merchant[_merchantAddr].scoreAmount >= _amount) {
            merchant[_merchantAddr].scoreAmount -= _amount;
            settledScoreAmount += _amount;
            emit SettleScoreWithBank(msg.sender, "积分清算成功");
            return;
        }
        else {
            emit SettleScoreWithBank(msg.sender, "您的积分余额不足，清算失败");
            return;
        }
    }
}








