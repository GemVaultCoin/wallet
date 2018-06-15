
var bip39 = require('bip39');
var hdkey = require('ethereumjs-wallet/hdkey');
var util = require('ethereumjs-util');
var pkModel = require('../../models/pk');
var l = require('../../logs')
var userModel =	require('../../models/User');
var Cryptr = require('cryptr');
var cryptr = new Cryptr(process.env.MP);

async function _genPath()	{
	var add_idx = await userModel.count() + 1
	return "m/44'/60'/1'/0/" + add_idx
}

async function _genPK(passphrase)	{

		//gen hdwallet

		var m = bip39.generateMnemonic()
		var seed = bip39.mnemonicToSeed(m, passphrase)
		var hdwallet = hdkey.fromMasterSeed(seed)
		var path = await _genPath()
		var childwallet = hdwallet.derivePath(path).getWallet()
		var addr = util.bufferToHex(childwallet.getAddress())

		pkplain = childwallet.getPrivateKeyString()

		const _cr = new Cryptr(passphrase)

		var pk = {
				pktxt: pkplain,
				pkcrypt: _cr.encrypt(pkplain),
				uid: "",
				pubkey: addr
		}

		return pk

}

function _postPK(usr, pk, res, params)	{

	var pk = new pkModel({
		pktxt: pk.pktxt,
		pkcrypt: pk.pkcrypt,
		uid: usr._id,
		pubkey: pk.pubkey
	})

	var _r = res

	pk.save(function(err, p)	{
			if (err) {
				l.runtime("Error saving pk", err, {rt:"e"})
				return res.send({ status: false, message: params.lang.serEncou});
			}

			l.runtime('PK saved', p, {rt:"t"})
			return _r.send({ status: true, message:	params.lang.emailMes});
	})
}

function Pk(params) {

  if (!params.valid) {
    l.runtime("Params are invalid in Pk constructor", params, {rt:"e"})
    throw "Params are invalid in Pk constructor"
  }

  this._params = params

}

Pk.prototype.saveUserWithPK = async function(res) {

  var pk = await _genPK(this._params.phplain)

	l.runtime("postUserAndPK [PK struct]", pk, {rt:"t"})

	var newuser = new userModel({
		name:	this._params.name,
		email:	this._params.email,
		password:	this._params.pencrypt,
		passphrase:	this._params.phencrypted,
		publickey:	pk.pubkey,
		emailerToken:	this._params.etoken,
		linkExpires:	this._params.epxires,
		mobile: this._params.phonenumber,
		phonecode: this._params.phonecode
	});

	var _r = res

  p = this._params
	newuser.save(function(err, usr)	{

		if (err) {
			l.runtime("Error saving user", err, {rt:"e"})
			return _r.send({status: false, message: params.lang.serEncou});
		}

		l.runtime('User saved', usr, {rt:"t"})
		return _postPK(usr, pk, _r, p)

	});
}

module.exports = Pk
