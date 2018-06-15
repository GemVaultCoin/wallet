var Tx = require('ethereumjs-tx');


//ABIs list
var issuerJSON = require('../build/contracts/Issuer.json')
var cfg = require('../ctoken.js')
var cfgpk = require('/.ctoken')
var issuer_abi = issuerJSON.abi

const PRIVATE_KEY = cfgpk.OWNER_PK
const ISSUER_ADDRESS = cfg.Issuer
const ISSUER_OWNER = cfg.Owner
const ETH_NETWORK = 4
const ETHNetworkProvider = "https://rinkeby.infura.io/8m9GjFe5QIkDl78RDNdS"

const GasPrice = 5000000000
const GasLimit = 3000000


var WebEth3 = require('web3');


async function collect()
{
      var web3eth = new WebEth3(new WebEth3.providers.HttpProvider(ETHNetworkProvider));

      const owner = COLLECTOR_OWNER;
      const caddr = COLLECTOR_ADDRESS
      var cC = new web3eth.eth.Contract(collectorJSON.abi, caddr,
                                      {
                                        gasPrice: GasPrice,
                                        from: owner
                                      })


      var chainID = process.env.ETH_NETWORK

      var c = await web3eth.eth.getTransactionCount(owner.toUpperCase())

      var rawTransaction = {
                      "from": owner,
                      "nonce": c,
                      "gasPrice": web3eth.utils.toHex(GasPrice),
                      "gasLimit": web3eth.utils.toHex(GasLimit),
                      "to": caddr,
                      "value": "0x0",
                      "data": cC.methods.withdrawCommission().encodeABI(),
                      "chainId": chainID
      };

      var privKey = new Buffer(COLLECTOR_PRIVATE_KEY, 'hex');
      console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
      var tx = new Tx(rawTransaction);

      tx.sign(privKey);
      var serializedTx = tx.serialize();

      var receipt = web3eth.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('receipt',function(r) {
          console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`)
        })
      .on('error', console.log)
      .on('transactionHash', function(hash) { console.log(hash);})
}

collect()
