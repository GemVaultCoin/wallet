var user = require('../models/User');
var pk  = require('./models/pk')
var web3 =	require('../webrpc.js');
var config =	require('../config');
var l = require('../logs');
var ethTx = require('ethereumjs-tx');

//contract build

var cjson = require('./Rent.json')

//test PK
var pk = '198145a2ac0de3c01cee12f90a15125ff2a96b9e21ca595e2d8be753c8e525c5'

//landlord
var publisher_address = '0x0684a537Ac795Db0Fd5B500B29E95DA33B3A7D6C'


async function _getGas() {
  var gasPrice = web3.utils.toHex(await web3.eth.getGasPrice());
  var gasLimit = web3.utils.toHex(config.GasLimit);
  return {gasPrice: gasPrice, gasLimit: gasLimit}
}

function getByteCode() {
  const c = new web3.eth.Contract(cjson.abi)
  return deploy = c.deploy({
      data: cjson.bytecode,
      arguments: [
          //landlord
          publisher_address,
          //tenant
          '0x9d901666540E1C9D056D030bD662D51689184922',
          //name
          'Petalz Residence Rental Agreement',
          //deposit
          1*1000,
          //monthly payment
          '500 USD/monthly',
          //confirmationsCount
          12
      ]}).encodeABI();
}

function getPK() {
 return Buffer(pk, 'hex')
}

async function confirmPayment(rcp) {

    const gas = await _getGas()

    this._opts = {
      address: rcp.contractAddress,
      gasLimit: web3.utils.toHex(gas.gasLimit)
    }

    var co = new web3.eth.Contract(cjson.abi, this._opts.address, this._opts)
    var nonce = await web3.eth.getTransactionCount(publisher_address);

    co.methods.confirmMontlhyPayment().estimateGas({from: publisher_address, gas: gas.gasLimit})
    .then(function(gasAmount) {

      if (gasAmount == gas.gasLimit) {
        return console.log("Balance is not enough")
      }

      const txParams = {
          from: publisher_address,
          nonce: web3.utils.toHex(nonce),
          gasPrice: gas.gasPrice,
          gasLimit: gas.gasLimit,
          to: co.options.address,
          value: "0x0",
          data: co.methods.confirmMontlhyPayment().encodeABI()
      }

      const ethtx = new ethTx(txParams);
      ethtx.sign(getPK())

      const serializedTx = '0x'+ethtx.serialize().toString('hex')

      l.runtime("Confirm payment transaction", txParams, {rt:"t"})

      web3.eth.sendSignedTransaction(serializedTx)
      .on('transactionHash', console.log)
      .on('error', console.log)
      .on('receipt', console.log)
    });

}

async function publish() {

    const gas = await _getGas()

    const data = getByteCode()

    var nonce = await web3.eth.getTransactionCount(publisher_address);

    const txParams = {
        from: publisher_address,
        nonce: web3.utils.toHex(nonce),
        gasPrice: gas.gasPrice,
        gasLimit: gas.gasLimit,
        value: '0x0',
    }

    const ethtx = new ethTx(txParams);
    ethtx.sign(getPK())

    const serializedTx = '0x'+ethtx.serialize().toString('hex')

    l.runtime("Sending ETH transaction", txParams, {rt:"t"})

    web3.eth.sendSignedTransaction(serializedTx)
    .on('transactionHash', console.log)
    .on('error', console.log)
    .on('receipt', function(r)  {
      console.log(r)
      confirmPayment(r)
      //testing send method

    })
}


publish()
