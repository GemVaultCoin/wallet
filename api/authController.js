var DB 					=	require('../db');
var crypto 				=	require('crypto');
var nodemailer 			=	require('nodemailer');
var web3  				=	require('../web3');
var randomstring 		=	require('randomstring');
var getLanguageMessage 	=	require('./getLanguageMessage');
var ejs 				=	require("ejs");
var ABI 				= require('../contracts/CrowdSaleABI.json');
var Record 				=	web3.eth.contract(ABI).at(process.env.COINCROWDSALE);


var transporter = nodemailer.createTransport({
	service: 'Gmail',
		auth: {
			user: 'tt085045@gmail.com',
			pass: 'testing@!@#$%'
		}
	});

module.exports = {
	userLogin :(req, res, next) => {
	  	var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
		if(req.body.username && req.body.password){
			DB.FinalUserDB.findOne({ email: req.body.username })
				.then((user) => {
					if(user.activated){
						var hashedpass = req.body.password;
						var servsalt = user.serversalt;
						var finalpass = crypto.createHash('sha256').update(hashedpass+servsalt).digest("hex")
						if(finalpass == user.password){
							req.session.currentUserEmail = user.email;
							req.session.currentUserName = user.name;
							req.session.currentUserKey = user.publickey;
							req.session.passphrase = user.passphrase;
							req.session.isLogged = true;
							req.session.isActivated = user.activated;
							req.session.etherBal = web3.fromWei(web3.eth.getBalance(req.session.currentUserKey),"ether");
							Record.balanceOf(req.session.currentUserKey, (err,result) => {
								req.session.tokenBal = result;
								res.send({status: true, message:lang.signsuccess, isLogged:req.session.isLogged});
							});
						}else{
							res.send({status: false, message:lang.wrongCre});
						}
					}else{
						return res.json({status: false, userStatus:false, message:lang.SerUseLogStaErrTex});
					}
				})
				.catch((err) => {

					console.log('err',err)
					res.send({ status: false, message:lang.couldNot});
				});
		}
		else{
			res.send({status: false, message: lang.notReserver});
		}
	},
	userSignUp : (req, res, next) => {
		var name = req.body.name;
		var email = (req.body.email).toLowerCase();
		var passHash = req.body.pass;
		var confPassHash = req.body.confPass;
		var code = req.body.code;
		var phno = req.body.phoneNo;
		var salt = req.body.psalt;
	  	var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

	  	Uphoneno_regex = new RegExp(/^\d{4,16}$/)
        if (!Uphoneno_regex.test(phno)) {
        	return res.send({ status: false, message:'Mobile number min 4 , max 16 length'})
        }
		if(name && email && passHash && confPassHash && code && phno && salt){
			if(passHash == confPassHash){
				DB.FinalUserDB.findOne({ email: req.body.email })
				.then((response) => {
					if (!response)
					{
						var servsalt = randomstring.generate(64);
						var passphrase = randomstring.generate(64);
						var encryptedPhrase = module.exports.encrypt(passphrase);
						var finpass = crypto.createHash('sha256').update(passHash+servsalt).digest('hex');
						web3.personal.newAccount(passphrase, (err, newaccountkey) => {
							if(err){
								return res.send({status: false, message: lang.serEncou});
							}if(newaccountkey){
								var token = randomstring.generate(32);
								var linkExpires = Date.now() + 86400000; //24 Hours
								ejs.renderFile("./views/emailTemplates/emailRegister.ejs", { name:name,tokenUrl:`http://${req.headers.host}/api/activate/${token}`}, function (err, data) {
									if (err) {
										return res.json({status:false,message:'Unable to send Verification Mail. Please try signing up later.'});
									}

									var mainOptions = {
										from:process.env.NOREPLYEMAIL,
										to: email,
										subject:'GemBank Registration',
										html: data
									};

									transporter.sendMail(mainOptions,  function (err, info) {

										console.log(err,info)
										if (err) {
											return res.json({status: false, message:'Unable to send Verification Mail. Please try signing up later.'});
										}else{
											var userData = {
												name: req.body.name,
												email: req.body.email,
												password: finpass,
												salt: req.body.psalt,
												serversalt: servsalt,
												activated: req.body.active,
												publickey: newaccountkey,
												passphrase: encryptedPhrase,
												phonenumber: req.body.phoneNo,
												phonCode: req.body.code,
												activationToken: token,
												activationLinkExpires: linkExpires
											}
											var userDetails = DB.FinalUserDB(userData);
											userDetails.save()
											.then((response) => {
												if(response){
													return res.json({status:true,message:lang.emailMes});
												}
											});
										}
									});
								});
							}
						});
					}else {
						res.send({ status:false, message: lang.useAlE});
					}
				}).catch(function (err) {
					res.send({ status: false, message: lang.serEncou });
				});
			}else{
				res.send({status: false, message:lang.passNo});
			}
		}else{
			res.send({status: false, message: lang.addDNo});
		}
	},
	encrypt:(text)=>{
		var cipher = crypto.createCipher(process.env.ALGORITHM, process.env.ENCRYPTPASS);
	  	var crypted = cipher.update(text,'utf8','hex')
	  	crypted += cipher.final('hex');
	  	return crypted;
	},
	getClientSalt :(req, res, next) => {
	    var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	    DB.FinalUserDB.findOne({ email: req.body.email })
	    .then((response) => {
	        if(response && response.disableLogin == false){
	            if(response.activated){
	                res.send({status:true, salt:response.salt});
	            }else{
	                res.send({status:false, userStatus:false,message: lang.plevisit});
	            }
	        }else if(response && response.disableLogin){
	            res.send({status:false, message:lang.accDisa});
	        }else{
	            res.send({status:false, message:lang.userNotFound})
	        }
	    }).catch((err) => {
	        res.send({status: false, message: lang.serEncou});
	    });
	},
	logoutUser:(req, res, next)=>{
	    var lang = req.query.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	    req.session.isLogged = false;
	    req.session.destroy();
	    res.send({ success: true, status: lang.logoutsuc, isLogged: false });
	}
};
