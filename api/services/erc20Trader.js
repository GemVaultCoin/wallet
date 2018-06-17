var web3 = require('../../webrpc')
var cfg = require('../../config')
var ctoken = require('../../ctoken')
var abiToken =	require('../../build/contracts/Trader.json');

function Erc20Trader() {

    this._opts = {
      address: ctoken.Trader,
      gasLimit: web3.utils.toHex(cfg.GasLimit)
    }

    this._ct = new web3.eth.Contract(abiToken.abi, this._opts.address, this._opts)
    return this._ct

}

Erc20Trader.prototype.getRate = async function()  {

  const rawRate = await this._ct.methods.rate().call()

}

module.exports = Erc20Trader
