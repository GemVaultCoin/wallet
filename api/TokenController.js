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

module.exports = {

	getTokenRate: async (req, res, next) => {

			
	}

	buyToken: async (req, res, next)	=>	{

		var vo = await rv.validate(req, res)

		if (vo.status) {

			var sendAmount = (parseFloat(req.body.amount)).toFixed(4);

			l.runtime("Amount to send:", sendAmount, {tag: "sendEtherMethod"});

			if (web3.utils.isAddress(req.body.toaddress) && req.body.toaddress && sendAmount) {

							var tx = new Tx(vo.usr, vo.pk)
							tx.sendETH(vo.usr.publickey, req.body.toaddress, sendAmount,
								 function(data)	{
									 		if (data.status) {
												return res.send({status: true, message: 'Transaction Created',
														tHash:data.hash, tReceipt:'receipt'});
											}

							 })

			} else {
	 				return res.send({status: false, message: 'Transaction faild, please try later'})
	 		}
		}

	//res.send({status:true, isCoinPayment: true, status:'Transaction Created', result: result, currency: req.body.currency})

		/*
		var paymentMode = req.body.currency;
		var amountToken = req.body.amount;
		var terms 		= req.body.terms;
		if(paymentMode && amountToken && terms && amountToken > 0){
			axios.post('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
			.then((value) => {
				var totalCostInEther = (amountToken / value.data.USD).toPrecision(8);
				client.createTransaction({
					'currency1' : 'USD',
					'currency2' : req.body.currency,
					'amount' : req.body.amount,
					'buyer_email': req.session.currentUserEmail,
					'custom': req.session.currentUserKey,
					'item_name': 'GEM',
					'item_number': req.body.amount
					},function(err, result){
					if(result){
						var crypto = (req.body.currency == 'ETH')?'ethereum':'bitcoin';
						var amount = parseFloat((parseFloat(result.amount) + 0.000001).toFixed(6));
						result.amount = amount;
						qrcode.toDataURL(`${crypto}:${result.address}?amount=${amount}`, {version: 6, errorCorrectionLevel:'M'},(err, qrImage) => {
								result.qrcode_url = qrImage;
								res.send({status:true, isCoinPayment: true, status:'Transaction Created', result: result, currency: req.body.currency});
						});
					}else{
						res.send({status:false, message:'Transaction faild try after some time'});
					}
				});
			}).catch((err) => {
				res.send({status:false, message:'We are unable to process your request at this time. Please try again later!'})
			});
		}else{
			res.send({status:false, message: "Please enter valid details"});
		}
		*/
	},

	creditToken:(req, res, next)	=>	{

		if(req.headers['user-agent'] !='CoinPayments.net IPN Generator'){
			console.log('==>Unauthorized use or access!.',req.headers['user-agent'])
			return res.status(401).send('==>Unauthorized use or access!.');

		}
		/*
		if(req.body.status == '100' && req.body.merchant == process.env.COINPAYMENTMERCHANTID){
			DB.TransactionDB.findOne({publickey: req.body.custom, txid: req.body.txn_id,status:"100"})
			.then((response) => {
				if(response && response!='' && response!=undefined && response!=null){
					console.log('==> Already credited.........................');
					return res.status(500).send('==>Already credited');
				}else{
					if(!response){
						var txdata = {
							email: req.body.email,
							publickey: req.body.custom,
							amount: req.body.item_number,
							valueusd: req.body.amount1,
							paymentmode: req.body.currency2,
							paymentval: req.body.amount2,
							txfee: req.body.fee,
							txid: req.body.txn_id,
							status:'100'
						};
						var Data = DB.TransactionDB(txdata);
						var addressTo = req.body.custom;
						var amount = parseFloat(req.body.item_number);
						var PH = module.exports.decrypt(process.env.COINOWNERKEY);
						web3.personal.unlockAccount(process.env.COINOWNER,PH, (err, unlocked) => {
							if (!unlocked) {
								return res.status(500).send();
							}else {
								Record.transferFrom(process.env.COINOWNER, addressTo, amount * process.env.TOKENDECIMALPLACE, { from: process.env.COINOWNER, gas: 70000 },(err, txid) => {
									console.log('err',err,'txid',txid)
									if (txid) {
											Data.save().then((Sa)=>{
												res.status(200).send('==>Transaction is successfully Processed!');
											}).catch((err)=>{
												console.log('err2',err)
												res.status(500).send();
											})
											console.log('==>Transaction created');
									}else if(err){
										console.log('==>Can not credit!,some error occured',err);
										return res.status(500).send('==>Can not credit!');
									}else {
										console.log('==>Can not credit!');
										return res.status(500).send('==>Can not credit!');
									}
								});
							}
						});
					}
				}
			})
			.catch((err) => {
				console.log('err',err)
				res.status(500).send();
			});
		}
		else
		{
			res.status(201).send();
		}
		*/
	},
	getTokenDetails:(req, res, next) => {
		res.status(200).send({ status:true, tokenBal: 0, tokenHolders: 0, walletUsers: 0});
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
	sendCurrency:(req, res, next)	=>	{
			res.send({status:false, message:lang.InsuFuTo})
			/*
	    var currencyType = req.body.currencyType;
	    var amount = req.body.amount;
	    var toAddr = req.body.receiverAddress;
	    var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	    if (web3.isAddress(toAddr)) {
	        if(currencyType == 'ETH' && (amount+0.0009) <= req.session.etherBal){
	        	console.log(req.session.passphrase)
	            var passphrase = module.exports.decrypt(req.session.passphrase);
	            web3.personal.unlockAccount(req.session.currentUserKey, passphrase, (err, unlocked) => {
	    		console.log('currencyType',web3.isAddress(toAddr))
	            	console.log(err,unlocked)
	                if (!unlocked) {
	                    return res.send({status:false, message: lang.WeUntoAc});
	                }else {
	                    web3.eth.sendTransaction({ from: req.session.currentUserKey, to: toAddr, value: web3.toWei(amount, "ether"),gas: 210000},
	                        (err, response) => {
	                            if (response) {
	                                return res.send({status:true, message: lang.TranSuccP});
	                            }else {
	                                return res.send({ status:false, message:lang.TraFaPlea });
	                            }
	                        });
	                    }
	                });
	        }else if(currencyType == 'GEM' && amount <= req.session.tokenBal && req.session.etherBal >= 0.005){
	            var passphrase = module.exports.decrypt(req.session.passphrase);
	            web3.personal.unlockAccount(req.session.currentUserKey, passphrase, (err, unlocked) => {
	                if (!unlocked) {
	                    return res.send({status:false, message:lang.WeUntoAc});
	                }else {
                    Record.transfer(toAddr, amount * process.env.TOKENDECIMALPLACE, { from: req.session.currentUserKey, gas: 210000 },
                        (error, txid) => {
                            if (txid) {
                                return res.send({status:true, message: lang.TranSuccP});
                            }else {
                                res.send({ status:false, message:lang.TraFaPlea });
                            }
                        });
                    }
                });
	        }else{
	            res.send({status:false, message:lang.InsuFuTo})
	        }
	    }else {
	        res.send({ status:false, message:lang.InvEthAdd})
	    }
			*/
	},
	getTokenTransaction:(req, res, next)	=>	{
			res.send({ status:false, message:lang.unatoret});
			/*
	    var lang = req.query.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	    var FromEvent = Record.Transfer({_from: req.session.currentUserKey}, { fromBlock: process.env.FROMBLOCK, toBlock: 'latest' });
	    FromEvent.get((error, fromresult) => {
	        if (fromresult) {
	            fromresult.forEach(function(element) {
	                element.timestamp = web3.eth.getBlock(element.blockNumber).timestamp;
	            }, this);
	            var ToEvent = Record.Transfer({_recipient: req.session.currentUserKey}, { fromBlock: process.env.FROMBLOCK, toBlock: 'latest' });
	            ToEvent.get((err, toresult) => {
	                if(toresult)
	                {
	                    toresult.forEach(function(element){
	                        element.timestamp = web3.eth.getBlock(element.blockNumber).timestamp;
	                    }, this);
	                    result = fromresult.concat(toresult);
	                    res.send({ status:true, message: result, currentUserKey: req.session.currentUserKey});
	                }
	            });
	        }else{
	            res.send({ status:false, message:lang.unatoret});
	        }
	    });
			*/
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
