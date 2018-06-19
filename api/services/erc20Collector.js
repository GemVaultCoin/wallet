var web3 = require('../../webrpc')
var cfg = require('../../config')
var ctoken = require('../../ctoken')
var abiToken =	require('../../build/contracts/Collector.json');

function Erc20Collector() {

    this._opts = {
      address: ctoken.Collector,
      gasLimit: web3.utils.toHex(cfg.GasLimit)
    }

    this._ct = new web3.eth.Contract(abiToken.abi, this._opts.address, this._opts)
    return this._ct

}

module.exports = Erc20Collector
