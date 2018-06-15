var web3 = require('../../webrpc')
var cfg = require('../../config')
var ctoken = require('../../ctoken')
var abiToken =	require('../../build/contracts/CoreToken.json');

function Erc20() {

    this._opts = {
      address: ctoken.CoreToken,
      gasLimit: web3.utils.toHex(cfg.GasLimit)
    }

    return new web3.eth.Contract(abiToken.abi, this._opts.address, this._opts)

}

module.exports = Erc20
