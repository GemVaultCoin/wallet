var axios 	=	require('axios');
var crypto	=	require('crypto');
var web3  	=	require('../webrpc');
var DB    	=	require('../db');
//var ABI   	=	require('../contracts/CrowdSaleABI.json');
//var Record	=	web3.eth.contract(ABI).at(process.env.COINCROWDSALE);
var qrcode	=	require('qrcode');
var coinpayments = require('coinpayments');
//var client  = new coinpayments({'key':process.env.COINPAYMENTAPIKEY,'secret':process.env.COINPAYMENTSECRET,'autoIpn':false});
var getLanguageMessage 	=	require('./getLanguageMessage');

var rv = require('./validation/request')
var Pk = require('./services/pk')
var Tx = require('./services/tx')
var l = require('../logs')
var erc20Trader = require('./services/erc20Trader')
var erc20 = require('./services/erc20')
var trader = new erc20Trader()
var token = new erc20()

module.exports = {

	getTokenRate: async (req, res, next) => {
			const rawRate = await trader.methods.rate().call()
			const decimals = await token.methods.decimals().call()
			return res.send({status: true, eth2token: rawRate, decimals: decimals})
	},

	buyToken: async (req, res, next)	=>	{

		var vo = await rv.validate(req, res)

		if (vo.valid) {

			var sendAmount = (parseFloat(req.body.amount)).toFixed(4);

			l.runtime("Amount to send:", sendAmount, {tag: "buyToken"});

			if (sendAmount) {

							var tx = new Tx(vo.usr, vo.pk)
							tx.sendETH(vo.usr.publickey, trader.options.address, sendAmount,
								 function(data)	{
									 		if (data.status) {
												return res.send({status: true, message: 'Transaction Created',
														tHash:data.hash, tReceipt:'receipt', addr: trader.options.address});
											}

							 })

			} else {
	 				return res.send({status: false, message: 'Transaction failed, please try later'})
	 		}
		}
	},

	getTokenDetails:(req, res, next) => {

		res.status(200).send({ status:true, tokenBal: 9500000, tokenHolders: 6, walletUsers: 4});
		/*
		DB.FinalUserDB.find()
		.then((data) => {
			if(data){
				axios.get(`https://api.ethplorer.io/getTokenInfo/${process.env.COINCROWDSALE}?apiKey=freekey`)
				.then((response) => {
					if(response.data.holdersCount >=0){
						res.status(200).send({status:true, tokenBal: 163578.1114, tokenHolders: response.data.holdersCount, walletUsers: data.length+200});
					}else{
						res.status(200).send({status:true, tokenBal: 163578.1114, tokenHolders: 226, walletUsers: data.length+200});
					}
				}).catch((err) => {
					res.status(200).send({status:true, tokenBal: 163578.1114,tokenHolders: 0, walletUsers: data.length+200});
				});
			}
		}).catch((err) => {
			res.status(200).send({ status:true, tokenBal: 0, tokenHolders: 0, walletUsers: 0});
		});
		*/
	},

	sendCurrency: async (req, res, next)	=>	{

			var vo = await rv.validate(req, res)
			var currencyType = req.body.currencyType;
			var sendAmount = req.body.amount;
	    var toAddr = req.body.receiverAddress;

			if (currencyType == 'ETH' && vo.valid) {

				l.runtime("Amount to send:", sendAmount, {tag: "buyToken"});

				if (sendAmount) {

								var tx = new Tx(vo.usr, vo.pk)
								tx.sendETH(vo.usr.publickey, toAddr, sendAmount,
									 function(data)	{
										 		if (data.status) {
													return res.send({status: true, message: vo.lang.TranSuccP,
															tHash:data.hash, tReceipt:'receipt', addr: toAddr});
												}

								 })

				} else {
		 				return res.send({status: false, message: vo.lang.TraFaPlea})
		 		}

			} else if (currencyType == 'GEM' && vo.valid)	{

					var sendAmount = (parseFloat(req.body.amount)).toFixed(4);
					l.runtime("Amount to send:", sendAmount, {tag: "buyToken"});

					var tx = new Tx(vo.usr, vo.pk)

					tx.transferERC20(vo.usr.publickey, toAddr, sendAmount,
						 function(data)	{
									if (data.status) {
										l.runtime("Tx sent", data, {tag:	"sendTokenMethod"});
										return res.send({status: true, message: vo.lang.TranSuccP,
												tHash:data.hash, tReceipt:'receipt'});
									} else {
										 l.runtime("Error ", data.code, {tag: "sendTokenMethod"});
										 res.send({status: false, message: vo.lang.TraFaPlea });
									}

					 })
			}
	},

	getTokenTransaction: async (req, res, next)	=>	{

		var vo = await rv.validate(req, res)

			if (vo.valid) {
					var tx = new Tx(vo.usr, vo.pk)
					tx.getCacheTxs(function(r)	{

							if (r.status)	{
									 res.send({status:true, txs: r.data, currentUserKey: vo.usr.publickey});
							} else {
								res.send({status:false, message:	vo.lang.unatoret});
							}
					})

			} else {
				res.send({status:false, message:	vo.lang.unatoret});
			}

	},

	backupPrivateKey:(req,res,next)	=> {
		res.send({status:false, message:lang.terro})
			/*
	    var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

	    DB.FinalUserDB.findOne({ email: req.body.email, publickey: req.session.currentUserKey })
	    .then((response) => {
	        if(response)
	        {
	            var hashedpass = req.body.hashedPass;
	            var servsalt = response.serversalt;
	            var finalpass = crypto.createHash('sha256').update(hashedpass+servsalt).digest("hex");
	            if(finalpass == response.password)
	            {
	                var addr = (req.session.currentUserKey).substr(2);
	                var path = '/root/.ethereum/keystore/';
	                var passphrase = module.exports.decrypt(req.session.passphrase);
	                fs.readdir(path, function(err, list)
	                {
	                    if(err) throw err;
	                    var regex = new RegExp(`${addr}$`);
	                    list.forEach(function(item)
	                    {
	                        if(regex.test(item))
	                        {
	                            fs.readFile(path+item,'utf-8',
	                                function(err, contents){
	                                    var data = JSON.parse(contents);
	                                    var privateKey = keythereum.recover(passphrase,data);
	                                    var hexPrivkey = privateKey.toString('hex');
	                                    res.send({status:rue, message: hexPrivkey});
	                            });
	                        }
	                    });
	                });
	            }
	            else
	            {
	                res.send({status:alse, message:lang.wronpe});
	            }
	        }
	    })
	    .catch((err)=>{
	        res.send({status:false, message:lang.terro});
	    });
			*/
	},
	decrypt:(text)	=>	{
		var decipher = crypto.createDecipher(process.env.ALGORITHM,process.env.ENCRYPTPASS);
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}
}
