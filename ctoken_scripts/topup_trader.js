require('dotenv').config()
var Tx = require('ethereumjs-tx');


//ABIs list
var issuerJSON = require('../build/contracts/Issuer.json')
var cfg_addr = require('../ctoken.js')
var cfg = require('../config.js')

var issuer_abi = issuerJSON.abi

const PRIVATE_KEY = process.env.OWNER_PK
console.log(process.env)
const ISSUER_ADDRESS = cfg_addr.Issuer
const ISSUER_OWNER = cfg_addr.Owner
const ETH_NETWORK = cfg.ChainId
const ETHNetworkProvider = cfg.ChainId

const GasPrice = 6688000000
const GasLimit = 2000000

var web3 = require('../webrpc');

async function trade()
{
      const owner = ISSUER_OWNER
      const caddr = ISSUER_ADDRESS
      const topup_value = 5000000000000000
      var cC = new web3.eth.Contract(issuer_abi, caddr,
                                      {
                                        gasPrice: GasPrice,
                                        from: owner
                                      })

      console.log(await cC.methods.owner().call({from:owner}))

      var chainID = ETH_NETWORK

      var c = await web3.eth.getTransactionCount(owner.toUpperCase())

      var rawTransaction = {
                      "from": owner,
                      "nonce": c,
                      "gasPrice": web3.utils.toHex(GasPrice),
                      "gasLimit": web3.utils.toHex(GasLimit),
                      "to": caddr,
                      "value": "0x0",
                      "data": cC.methods.trade(topup_value).encodeABI(),
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
      .on('transactionHash', function(hash) { console.log(hash);})
}

trade()
