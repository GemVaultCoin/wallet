require('dotenv').config()
var l = require('../logs')
var erc20Trader = require('../api/services/erc20Trader')
var erc20Collector = require('../api/services/erc20Collector')
var erc20 = require('../api/services/erc20')
var trader = new erc20Trader()
var token = new erc20()
var collector = new erc20Collector()
var web3 = require('../webrpc');

async function show() {

  const traderB = await web3.eth.getBalance(trader.options.address);
  const traderC = await trader.methods.commissionCollected().call()

  const colAddr = await trader.methods.collector().call()
  const colB = await web3.eth.getBalance(colAddr);
  const colIAddrs = await collector.methods.getInvestors().call()

  var commAddr = []
  for (var i=0; i<colIAddrs.length; i++)  {

    commAddr.push({
            addr: colIAddrs[i],
            commission: await collector.methods.investorCommissions(colIAddrs[i]).call()})
  }

  l.runtime("Commission in trader", web3.utils.fromWei(traderC,'ether'), {rt:"t"})
  l.runtime("Collector addr:", colAddr, {rt:"t"})
  l.runtime("Commission in collector", web3.utils.fromWei(colB), {})
  l.runtime("Investor addresses", commAddr, {})

}

show()
