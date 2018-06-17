var web3 = require('../../webrpc')
var cfg = require('../../config')
var ctoken = require('../../ctoken')
var abiToken =	require('../../build/contracts/CoreToken.json');

function Erc20() {

    this._opts = {
      address: ctoken.CoreToken,
      gasLimit: web3.utils.toHex(cfg.GasLimit)
    }

    this._ct = web3.eth.Contract(abiToken.abi, this._opts.address, this._opts)
    return this._ct
}

Erc20Trader.prototype.getDecimals = async function()  {
  

}

module.exports = Erc20
