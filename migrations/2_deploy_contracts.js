var Auction = artifacts.require("contract");
module.exports = function(deployer) {
  deployer.deploy(Auction,17,200,2);
};
