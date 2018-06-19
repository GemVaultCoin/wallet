
var web3 = require('../../webrpc.js');
var config = require('../../config.js');
var ethTx = require('ethereumjs-tx');
var l = require('../../logs');
var txCache = require('../../models/TxCache');
var Cryptr = require('cryptr');
var bignumber = require('bignumber.js');
var erc20 = require('./erc20');
var erc20trader = require('./erc20Trader');

//return err codes
const errBalance = 0;
const errEstGas = 1;
const errOutOfGas = 2;
const errSendToken = 3;
const errFromAddr = 4;
const errToAddr = 5;
const errAmount = 6;

var cryptr = new Cryptr(process.env.MP);
var co = new erc20();
var ct = new erc20trader();

async function _cacheTx(tx, cur, hash)
{
   if (!tx || !cur || !hash)
    return

   var t = new txCache({
     tx: hash,
     amount: web3.utils.hexToNumberString(tx.value),
     currency: cur,
     status: 0,
     from: tx.from,
     to: tx.to
   })

   t.save().then((r) => {
     console.log("Transaction saved")
     console.log(r)
   });
}

function _decryptPK()
{
      //get and decrypt passphrase
      var phenc = this._usr.passphrase
      var phdecr =	cryptr.decrypt(this._usr.passphrase)
      var phascii = web3.utils.hexToAscii(phdecr)
      var phjson = JSON.parse(phascii)
      var phfinal = phjson.test

      var _cr = new Cryptr(phfinal)

      var decr = _cr.decrypt(this._pk.pkcrypt)
      if (decr.indexOf('0x') == 0) {
              decr = decr.split('0x')[1]
      }

      return Buffer(decr, 'hex')
}

async function _balanceEnough(from, gas, weiAmount)
{

  var balanceinWei = await web3.eth.getBalance(from);
  var txFeeinWei = gas.gasPrice*gas.gasLimit;
  var effbalance = balanceinWei - txFeeinWei;

  if(parseFloat(effbalance) <= parseFloat(weiAmount)) {
    l.runtime("Insufficient Balance",
      {
        effB: parseFloat(effbalance),
        ethB: parseFloat(weiAmount)
      }, {rt:'e'})
      return false;
  }

  return true;
}

async function _getGas() {
  const gp = await web3.eth.getGasPrice()
  l.runtime("Network gas price estimation:", gp, {rt:"t"})
  var gasPrice = web3.utils.toHex(gp*3);
  var gasLimit = web3.utils.toHex(config.GasLimit);
  return {gasPrice: gasPrice, gasLimit: gasLimit}
}

function Tx(usr, pk)  {

  if (usr == null) {
    l.runtime("User is not defined in tx contructor", usr, {rt:"e"})
  }

  if (pk == null) {
    l.runtime("PK is not defined in tx contructor", usr, {rt:"e"})
  }

  this._pk = pk
  this._usr = usr

}

Tx.prototype.sendETH = async function(from, to, amountETH, cb) {

  if (!web3.utils.isAddress(from))  {
    return cb({status: false, code: errFromAddr})
  }

  if (!web3.utils.isAddress(to))  {
    return cb({status: false, code: errToAddr})
  }

  if (!amountETH || amountETH <= 0)  {
    return cb({status: false, code: errAmount})
  }

  const gas = await _getGas()

  var nonce = await web3.eth.getTransactionCount(from);

  const weis = new bignumber(amountETH*Math.pow(10,18));
  var weisHx = web3.utils.toHex(weis);

  const txParams = {
      from: from,
      nonce: web3.utils.toHex(nonce),
      gasPrice: gas.gasPrice,
      gasLimit: gas.gasLimit,
      to: to,
      value: weisHx,
      chainId: parseFloat(config.ChainId)
  }

  if (!_balanceEnough.call(this, from, gas, weis))  {
    return cb({status: false, code: errBalance})
  }

  const ethtx = new ethTx(txParams);
  ethtx.sign(_decryptPK.call(this))

  const serializedTx = '0x'+ethtx.serialize().toString('hex')

  l.runtime("Sending ETH transaction", txParams, {rt:"t"})

  web3.eth.sendSignedTransaction(serializedTx)
  .on('transactionHash', function(hash) {
      _cacheTx(txParams, 'ETH', hash)
      cb({status: true, hash: hash, txprms: txParams})
  })

}

Tx.prototype.transferERC20 = async function(from, to, amountERC20, cb) {

    if (!web3.utils.isAddress(from))  {
      return cb({status: false, code: errFromAddr})
    }

    if (!web3.utils.isAddress(to))  {
      return cb({status: false, code: errToAddr})
    }

    if (!amountERC20 || amountERC20 <= 0)  {
      return cb({status: false, code: amountERC20})
    }

    const gas = await _getGas()
    const decs = await co.methods.decimals().call({from: from})
    const symb = await co.methods.symbol().call({from: from})

    var nonce = await web3.eth.getTransactionCount(from);

    const val = amountERC20*Math.pow(10, decs)
    const _this = this

    co.methods.transfer(to, val).estimateGas({from: from, gas: gas.gasLimit})
    .then(function(gasAmount) {

      if (gasAmount == gas.gasLimit) {
        return cb({status: false, code: errOutOfGas})
      }

      const txParams = {
          from: from,
          nonce: web3.utils.toHex(nonce),
          gasPrice: gas.gasPrice,
          gasLimit: gas.gasLimit,
          to: co.options.address,
          value: "0x0",
          data: co.methods.transfer(to, val).encodeABI(),
          chainId: parseFloat(config.ChainId)
      }

      const ethtx = new ethTx(txParams);
      ethtx.sign(_decryptPK.call(_this))

      const serializedTx = '0x'+ethtx.serialize().toString('hex')

      l.runtime("Transfer ERC20 transaction", txParams, {rt:"t"})

      web3.eth.sendSignedTransaction(serializedTx)
      .on('transactionHash', function(hash) {
          txParams.value = web3.utils.toHex(val)
          _cacheTx(txParams, symb, hash)
          cb({status: true, hash: hash, txprms: txParams})
      })
      .on('error',  function(err) {
        l.runtime("Error sending token", err, {rt:"e"})
        cb({status: false, err: err, code: errSendToken})
      });
    })
    .catch(function(err)
    {
      l.runtime("Can't get estimated gas", err, {rt:"e"})
      return cb({status: false, code: errEstGas})
    });
}

Tx.prototype.getBalance = async function()  {

  const weiAmount = await web3.eth.getBalance(this._usr.publickey);
  const etherAmount = web3.utils.fromWei(weiAmount,'ether');

  l.runtime('Fetching ETH balance', etherAmount, {rt:"t"})

  tokenB = await co.methods.balanceOf(this._usr.publickey)
                  .call({from:this._usr.publickey})

  l.runtime('Fetching TOKEN balance', tokenB, {rt:"t"})

  tokenB = tokenB / config.TokenDecimalPlace

  return {ethB: etherAmount, tokenB: tokenB}

}

Tx.prototype.getCacheTxs = async function(cb) {

  const decs = await co.methods.decimals().call()

  txCache.find({$or:[{from: this._usr.publickey}, {to: this._usr.publickey}]}).sort({"updated_at":-1})
    .then((trs) => {

        for (var i=0; i<trs.length; i++)
        {
            if (trs[i].currency == 'ETH') {
              trs[i].amount = web3.utils.fromWei(trs[i].amount, 'ether')
            } else {
              trs[i].amount = trs[i].amount/(Math.pow(10, decs)).toFixed(decs)
            }
        }

        if (trs) {
          return cb({status: true, data: trs});
        }

    }).catch((err)=>{
        l.runtime(err.message, {err: err}, {rt: 'e'})
        return cb({status: false, err: err});
    });

}



module.exports = Tx
