var Score = artifacts.require("./Score.sol");
module.exports = function(deployer) {
  deployer.deploy(Score);
};
