var userModel =	require('../models/User');
var crypto 				=	require('crypto');
var nodemailer 			=	require('nodemailer');
var randomstring 		=	require('randomstring');
var getLanguageMessage 	=	require('./getLanguageMessage');
var ejs 				=	require("ejs");
var web3  				=	require('../webrpc');
var Tx = require('./services/tx');
var sparkPostTransport = require('nodemailer-sparkpost-transport');

var transporter = nodemailer.createTransport(
		sparkPostTransport({sparkPostApiKey: process.env.SPARKPOST_API_KEY}));

var l = require('../logs')

module.exports = {
	getUserDetails: async (req,res,next) => {
		var lang = req.query.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

		const t = new Tx({publickey: req.session.currentUserKey}, {})
		const balance = await t.getBalance()

		req.session.etherBal = balance.ethB
		req.session.tokenBal = balance.tokenB

		res.send({success: true, currentUserName:req.session.currentUserName, currentUserKey:req.session.currentUserKey, currentEtherBalance: req.session.etherBal, currentTokenBalance: parseFloat(req.session.tokenBal/10000), currentUserEmail: req.session.currentUserEmail});

		/*
		Record.balanceOf(req.session.currentUserKey, (err,result) => {
			if(err){
				return res.status(500).send({success:false, status:lang.terro})
			}
			req.session.tokenBal = result;
					});
		*/

	},
	editUserProfile:(req, res, next)=>{
		var type = req.body.type;
		var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
		if(type == 'Name' && req.body.newValue){
			var newName = req.body.newValue;
			userModel.findOne({name:req.session.currentUserName})
			.then((response) => {
				response.name = newName;
				response.save()
				.then((result) => {
					if (result) {
						req.session.currentUserName = result.name;
						res.send({success: true, status:lang.nameChSucc,newName:result.name});
					}
				});
			})
			.catch((err) => {
				res.send({success: false, status:lang.serisunatopr})
			});
		} else if(type == 'Password'){
			var newPassword = req.body.newValue;
			userModel.findOne({email: req.session.currentUserEmail})
			.then((response) => {
				var servsalt = response.serversalt;
				var finalpass = crypto.createHash('sha256').update(newPassword+servsalt).digest("hex");
				if(finalpass == response.password){
					res.send({success: false, status:lang.causesaold});
				}else{
					response.password = finalpass;
					response.save()
					.then((response) => {
						if(response)
						{
							res.send({success: true, status:lang.passchsucc});
						}
					})
					.catch((err) =>{
						res.send({success: false, status:lang.wearunato});
					});
				}
			}).catch((err) => {
				res.send({success: false, status:lang.wearunato});
			});
		}
	},
	sendPasswordRecoveryEmail:(req, res, next)=>{
		var email = req.body.email;
		var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

		userModel.findOne({email:email})
		.then((user) => {
			if(!user){
				res.send({success:false, status: lang.useNoPenReg});
			}else{
				RESETPASSWORDTOKEN = randomstring.generate(32);
				RESETPASSWORDEXPIRES = Date.now() + 3600000;
				ejs.renderFile("./views/emailTemplates/forgotPass.ejs", { name:user.name,email:user.email,tokenUrl:`http://${req.headers.host}/api/recovery/${RESETPASSWORDTOKEN}`}, function (err, data) {
					if (err) {
						return res.json({status:false,message:'Unable to send Verification Mail. Please try signing up later.'});
					}
					var mainOptions = {
						from:process.env.NOREPLYEMAIL,
						to: user.email,
						subject:'GemBank Registration',
						html: data
					};

					transporter.sendMail(mainOptions,  function (err, info) {
						if (err) {
							res.status(200).send({success:true, status:lang.walPassResMess});
						}else{
							user.resetPasswordToken = RESETPASSWORDTOKEN
							user.resetPasswordExpires = RESETPASSWORDEXPIRES
							user.save().then((response) => {
								if(response){
									return res.json({status:true,message:lang.emailMes});
								}
							});
						}
					});
				});
			}
		}).catch((err) => {
			res.status(500).send({success:false, status:lang.walPassResMessInserEr});
		});
	},
	forgotPasswordIndex:(req,res,next)=>{
		if(!req.params.token){
			res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
		}else{
			DB.FinalUserDB.findOne({resetPasswordToken: req.params.token})
			.then((user) => {
				if(!user){
					res.render('./pages/common', { title: 'Link Expired!', heading:'Sorry Your Link is Expired!',message: 'Your Password Recovery Link is expired. Please visit the login page and click on the forgot password button to re-generate the password reset link', linkHref:'/',linkText:'Click here to go to login page'});
				}else if(new Date(user.resetPasswordExpires).getTime() < Date.now()){
					res.render('./pages/common', { title: 'Link Expired!', heading:'Sorry Your Link is Expired!',message: 'Your Password Recovery Link is expired. Please visit the login page and click on the forgot password button to re-generate the password reset link', linkHref:'/',linkText:'Click here to go to login page'});
				}else{
					res.render('./pages/password', {title: 'Reset Password', userEmail: user.email});
				}
			}).catch((err) => {
				res.render('./pages/common', { title: 'Error!', heading:'Technical Error Occoured!', message: 'We are unable to process your request due to some technical issues. Please try again.', linkHref:'/',linkText:'Click Here To Login'});
			})
		}
	},
	resetPasswordAndSave:(req, res, next)=>{
		var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
		var HELLO = req.body.localStorage == "zh_CN" ? "你好": "Hello"
		var confirpayou  = req.body.localStorage == "zh_CN" ? "这是确认您的帐户的密码": "This is a confirmation that the password for your account "
		var haBeenCh     = req.body.localStorage == "zh_CN" ? "刚刚改变了": "has just been changed."

		DB.FinalUserDB.findOne({email: req.body.email})
		.then((user) => {
			if(!user){
				res.render('./pages/common', { title: lang.LinkExp, heading: lang.soryouaclin, message: lang.pleRegyouRespas, linkHref: '/', linkText: lang.cliHeL });
			}else if(new Date(user.resetPasswordExpires).getTime() < Date.now()){
				res.render('./pages/common', { title: 'Link Expired!', heading:'Sorry Your Link is Expired!',message: 'Your Password Recovery Link is expired. Please visit the login page and click on the forgot password button to re-generate the password reset link', linkHref:'/',linkText:'Click here to go to login page'});
			} else{
				var hashedpass = req.body.password;
				var servsalt = user.serversalt;
				var finalpass = crypto.createHash('sha256').update(hashedpass+servsalt).digest("hex");
				if(finalpass != user.password){
					user.password = finalpass;
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;
					user.save()
					.then((result) => {
						if(result){
							return res.send({status: true, message:lang.passchsucc})
						}else{
							return res.status(500).send({status:false, message:lang.walPassResMessInserEr});
						}
					}).catch((err) => {
						return res.status(500).send({status:false, message:lang.walPassResMessInserEr});
					});
				}else{
					return res.send({status: false, message: lang.yoCanEnAnAle})
				}
			}
		}).catch((err) => {
			return res.status(500).send({status:false, message:lang.walPassResMessInserEr});
		})
	},
	verifyAccountByEmail:(req,res,next)=>{
		if (!req.params.token) {
			res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
		} else {
			userModel.findOne({ emailerToken: req.params.token })
			.then((response) => {
				if (new Date(response.linkExpires).getTime() < Date.now()) {
					res.render('./pages/common', { title: 'Link Expired!', heading: 'Sorry Your Activation Link is Expired!', message: 'Your activation link is expired. Click below to resend the activation link', linkHref: `https://resend/${response.emailerToken}`, linkText: 'Resend Activation Mail' });
				} else {
					response.status = true;
					response.linkExpires = null;
					response.emailerToken = null;
					response.save().then((result) => {
						if (result) {
							res.render('./pages/common', { title: 'GemBank Wallet', heading: 'Activation Successfull!', message: 'Your account is successfully activated. Please log in to continue.', linkHref: '/', linkText: 'Click Here To Login' });
						}
					});
				}
			}).catch((err) => {
				l.runtime("Error verifying email", err, {rt:"e"})
				res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
			})
		}
	},
	getEmailActivationLink:(req,res,next)=>{
		var token = randomstring.generate(32);
		var linkExpires = Date.now() + 86400000; //24 Hours
		var email = req.body.email;
		var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

		DB.FinalUserDB.findOne({email:email})
		.then((user) => {
			if(!user){
				return res.send({ status: false, message: lang.serEncou });
			} else{
				ejs.renderFile("./views/emailTemplates/emailRegister.ejs", { name:user.name,tokenUrl:`http://${req.headers.host}/api/activate/${token}`}, function (err, data) {
					if (err) {
						return res.send({ status: false, message: lang.serEncou });
					}
					var mainOptions = {
						fromWei:process.env.NOREPLYEMAIL,
						to: user.email,
						subject:'GemBank Notification',
						html: data
					};

					transporter.sendMail(mainOptions,  function (err, info) {
						if (err) {
							return res.send({ status: false, message: lang.serEncou });
						}else{
							user.activationToken		=	token
							user.activationLinkExpires	=	linkExpires
							user.save().then((response) => {
								if(response){
									return res.json({status:true,message:lang.emailMes});
								}else{
									return res.send({ status: false, message: lang.serEncou });
								}
							});
						}
					});
				});
			}
		}).catch((err)=>{
			console.log('err',err)
			return res.send({ status: false, message: lang.serEncou });
		})
	}
};
