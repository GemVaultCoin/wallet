var userModel =	require('../models/User');
var crypto 				=	require('crypto');
var nodemailer 			=	require('nodemailer');
var web3  				=	require('../webrpc');
var randomstring 		=	require('randomstring');
var getLanguageMessage 	=	require('./getLanguageMessage');
var ejs 				=	require("ejs");
//var ABI 				= require('../contracts/CrowdSaleABI.json');
//var Record 				=	web3.eth.contract(ABI).at(process.env.COINCROWDSALE);

var sparkPostTransport = require('nodemailer-sparkpost-transport');
var transporter = nodemailer.createTransport(sparkPostTransport({
	'sparkPostApiKey': process.env.SPARKPOST_API_KEY
}));

var rv = require('./validation/request')
var Pk = require('./services/pk')
var Tx = require('./services/tx')
var l = require('../logs')

function notifyAndCreate(params, pk, res) {

		l.runtime("notifyAndCreate[params]", params, {rt:"t"})

		ejs.renderFile("./views/emailTemplates/emailRegister.ejs",
		 			{
					 name:	params.name,
					 tokenUrl:`http://${params.host}/api/activate/${params.etoken}`},

					 function (err, data)	{

						 if (err) {
								 return res.json({status:false, message:'Unable to send Verification Mail. Please try signing up later.'});
						 }

						 var mainOptions = {
							 from:process.env.NOREPLYEMAIL,
							 to: params.email,
							 subject:'GemBank Registration',
							 html: data
						 };

						 transporter.sendMail(mainOptions,  function (err, info) {
							 if (err) {
								 l.runtime("Error sending email", err, {rt:"e"})
								 return res.json({status:false, message:'Unable to send Verification Mail. Please try signing up later.'});
							 }
							 //saving user and private key
							 return pk.saveUserWithPK(res)
						 })
					 })
}

module.exports = {
	userLogin : async (req, res, next) => {

			var v = await rv.validate_signin(req, res)

			if (v.valid)	{
				req.session.currentUserEmail = v.usr.email;
				req.session.currentUserName = v.usr.name;
				req.session.currentUserKey = v.usr.publickey;
				//req.session.passphrase = user.passphrase;
				req.session.isLogged = true;
				req.session.isActivated = v.usr.status;

				const t = new Tx(v.usr, v.pk)
				const balance = await t.getBalance()

				req.session.etherBal = balance.ethB
				req.session.tokenBal = balance.tokenB
				return res.send({status: true, message:v.lang.signsuccess, isLogged:req.session.isLogged});
			}
	},

	userSignUp : async (req, res, next) => {

		var params = await rv.validate_signup(req, res)

		if (params.valid) {

			//generating privatekey structure
			var pk = new Pk(params)

			//sending notification and store data to database
			return notifyAndCreate(params, pk, res)
		}

	},

	encrypt:(text)=>{
		var cipher = crypto.createCipher(process.env.ALGORITHM, process.env.ENCRYPTPASS);
	  	var crypted = cipher.update(text,'utf8','hex')
	  	crypted += cipher.final('hex');
	  	return crypted;
	},

	logoutUser:(req, res, next)=>{
	    var lang = req.query.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	    req.session.isLogged = false;
	    req.session.destroy();
	    res.send({ success: true, status: lang.logoutsuc, isLogged: false });
	}
};
