var mongoose = require('mongoose');
var usrModel = require('../../models/User');
var pkModel =	require('../../models/pk');
var l = require('../../logs')
var getLanguageMessage = require('../getLanguageMessage');
var web3 = require('../../webrpc.js');
var Cryptr = require('cryptr');
var cryptr = new Cryptr(process.env.MP);
var crypto = require('crypto');
var randomstring = require("randomstring");

async function userExists(email)	{
		var c = await usrModel.find({email: email, deleted: false}).count()
		return c > 0;
}

//Validates request params and returns JSON object

async function validate(req, res) {

  //validation object
  var vo = {
      lang: null,
      usr: null,
      pk: null,
      status: true
  }

  //getting locale
	var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

  if (!lang) {
    l.runtime("Validation error on getting locale", lang, {rt:"t"})
    return res.send({status: false, message: lang.buyTUauthAce, msg: 'language not sent'});
  }

  vo.lang = lang

  //checking user
  if (!req.session.currentUserEmail || req.session.currentUserEmail =='' || req.session.currentUserEmail==null) {
   l.runtime("Validation error on getting user", req.session.currentUserEmail, {rt:"t"})
   return res.send({ status: false, message:lang.buyTUauthAce});
  }

  //fetching user
  var user = await usrModel.findOne({email: req.session.currentUserEmail}).exec()

  if (!user) {
    l.runtime("Validation error on getting user [not found]", req.session.currentUserEmail, {rt:"t"})
    return res.send({ status: false, message:lang.buyTUauthAceUsNotFo});
  }

  vo.usr = user

  //fetching pk data
  var pk = await pkModel.findOne({uid: user._id.toString()}).exec()

  if (!pk) {
    l.runtime("Validation error on getting PK [not found]", vo.usr, {rt:"t"})
    return res.send({ status: false, message:lang.buyTUauthAceUsNotFo});
  }

  vo.pk = pk

  //l.runtime("Tracing request validation", vo, {rt:"t"})
  vo.valid = true
  return vo

}

//Validates request for publisher
function validate_publisher(req, res) {

    if (!req.body
       || !req.body.data || req.body.data == null
       || !req.body.abi || req.body.abi == null) {
      return res.status(400).send({status: false, message: "Bad parameters"})
    }

    return {
      abi: req.body.abi,
      bytecode: req.body.bytecode,
      args: req.body.arguments
    }
}

//Validates sign up
async function validate_signup(req, res)	{

		if (!req.body)	{
			 return res.status(400).send({ status: false, message: "Invalid request"});
		}

		//Validation object
		var vo = {
				lang: req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en,
				name: req.body.name,
				email: req.body.email,
				password: req.body.pass,
				repassword: req.body.confPass,
				phonenumber: req.body.phoneNo,
				phonecode: req.body.phonCode
		}

		if (!vo.name || !vo.email || !vo.password
						|| !vo.repassword || vo.email == undefined
						|| vo.email == null) {
							 return res.send({ status: false, message: lang.signInvData});
		}

		//user exists
		const ex = await userExists(vo.email)

		if (ex) {
			return res.send({ status: false, message: vo.lang.regiUsAlex})
		}

		//password crypting routine
		vo.phash = web3.utils.toHex({test: vo.password});
		vo.pencrypt = cryptr.encrypt(vo.phash);
		vo.rephash =	web3.utils.toHex({test: vo.repassword});

		//passphrase gen routine
		vo.phplain = randomstring.generate(13);
		vo.phhash	=	web3.utils.toHex({test: vo.phplain});
		vo.phencrypted = cryptr.encrypt(vo.phhash);

		//email confirmation link
		var rndv =	randomstring.generate(33);
		vo.etoken =	rndv + Date.now();
		vo.epxires =	Date.now() + 86400000; //24 Hours
		vo.host = req.headers.host

		//password validation
		if (vo.phash != vo.rephash) {
			 return res.send({ status: false, message: vo.lang.registeConPasDM});
		}
		else {
      vo.valid = true
			return vo
		}
}

async function validate_signin(req, res)	{

	if (!req.body || !req.body.username || !req.body.password)	{
		 return res.status(400).send({ status: false, message: "Invalid request"});
	}

	var vo = {
			lang: req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en
	}

	//fetching user
	var user = await usrModel.findOne({email: req.body.username}).exec()

	if (!user) {
		l.runtime("Validation error on getting user [not found]", req.body.username, {rt:"t"})
		return res.send({ status: false, message:lang.buyTUauthAceUsNotFo});
	}

	vo.usr = user

	if (!user.status) {
		return res.status(403).json({status: false, userStatus:false, message:lang.SerUseLogStaErrTex});
	}

	//validating password
	var password = req.body.password;
	var password_hash =	web3.utils.toHex({test: password});
	var password_final = cryptr.encrypt(password_hash);

	if (password_final != user.password)	{
		l.runtime("Validation error password missmatch", req.body.username, {rt:"t"})
		return res.status(403).send({status: false, message:lang.wrongCre});
	}

	//fetching pk data
	var pk = await pkModel.findOne({uid: user._id.toString()}).exec()

	vo.pk = pk
  vo.valid = true

  l.runtime("Tracing request validation", vo, {rt:"t"})

  return vo

}


module.exports = {validate, validate_publisher, validate_signup, validate_signin}
