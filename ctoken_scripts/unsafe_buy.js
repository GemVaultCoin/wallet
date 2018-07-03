require('dotenv').config()
var Tx = require('ethereumjs-tx');


//ABIs list
var cJSON = require('../build/contracts/Trader.json')
var cfg_addr = require('../ctoken.js')
var cfg = require('../config.js')

var abi = cJSON.abi

const PRIVATE_KEY = process.env.OWNER_PK
console.log(process.env)
const TRADER_ADDRESS = cfg_addr.Trader
const TRADER_OWNER = cfg_addr.Owner
const ETH_NETWORK = cfg.ChainId
const ETHNetworkProvider = cfg.ChainId

const GasPrice = 7688000000
const GasLimit = 2000000

var web3 = require('../webrpc');

async function set_rate()
{
      const owner = TRADER_OWNER
      const caddr = TRADER_ADDRESS
      const value = 950000000000000
      const receipient = '0x05f73d2d04ddb3a983bdc26546e1e8c41685e9ee'

      var cC = new web3.eth.Contract(abi, caddr,
                                      {
                                        gasPrice: GasPrice,
                                        from: owner
                                      })

      console.log('Owner: ' + await cC.methods.owner().call({from:owner}))

      var prev_rate = await cC.methods.rate().call({from:owner})
      console.log('Prev rate: ' + prev_rate)

      var chainID = ETH_NETWORK

      var c = await web3.eth.getTransactionCount(owner.toUpperCase())

      var rawTransaction = {
                      "from": owner,
                      "nonce": c,
                      "gasPrice": web3.utils.toHex(GasPrice),
                      "gasLimit": web3.utils.toHex(GasLimit),
                      "to": caddr,
                      "value": "0x0",
                      "data": cC.methods.unsafeBuyTokens(receipient, value).encodeABI(),
                      "chainId": chainID
      };

      var privKey = new Buffer(PRIVATE_KEY, 'hex');
      console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
      var tx = new Tx(rawTransaction);

      tx.sign(privKey);
      var serializedTx = tx.serialize();

      var receipt = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('receipt',function(r) {
          console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`)
        })
      .on('error', console.log)
      .on('transactionHash', function(hash) {
         console.log(hash)
         cC.methods.rate().call().then(console.log)
       })
}

set_rate()
