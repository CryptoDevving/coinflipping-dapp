let CoinToFlip = artifacts.require("./CoinToFlip.sol");

module.exports = function(deployer, network, accounts) {
  if (accounts) {
    console.log("AAAAAAAAAAAAAA", accounts[0])
    deployer.deploy(CoinToFlip, {
      from: accounts[0],
      value: "1000000000000000000"
    });
  }
};
