var express = require('express');
var axios = require('axios');
var router = express.Router();
var authenticate = require('../authentication');
var DB = require('../db');
var qrcode = require('qrcode');

router.get('/', function (req, res, next) {
	res.render('./pages/login', { title: 'GemVault Wallet' });
});

router.get('/dashboard', authenticate, function (req, res, next) {
	axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
	.then((value) => {
		res.render('./pages/dashboard', { title: 'Dashboard', userName: req.session.currentUserName, icoEndDate: req.icoEndDate, tokenBal: parseFloat(req.session.tokenBal/10000).toFixed(4), usdBal: parseFloat(req.session.tokenBal/10000).toFixed(4), ethBal: parseFloat(req.session.etherBal).toFixed(4), usdEthBal: parseFloat(req.session.etherBal * value.data.USD).toFixed(4), profileName:req.session.currentUserName, userEmail:req.session.currentUserEmail, etherAddress: req.session.currentUserKey});
	})
	.catch((err) => {
		res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
	});
});

router.get('/address', authenticate, function (req, res, next) {
	axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
	.then((value) => {
		qrcode.toDataURL(`ethereum:${req.session.currentUserKey}`, {version: 4, errorCorrectionLevel:'M'},(err, qrImage) => {
			res.render('./pages/address', { title: 'Address', etherAddress: req.session.currentUserKey, userName: req.session.currentUserName, qrImage: qrImage, tokenBal: parseFloat(req.session.tokenBal/10000).toFixed(4), usdBal: parseFloat(req.session.tokenBal/10000).toFixed(4), ethBal: parseFloat(req.session.etherBal).toFixed(4), usdEthBal: parseFloat(req.session.etherBal * value.data.USD).toFixed(4),profileName:req.session.currentUserName, userEmail:req.session.currentUserEmail});
		});
	})
	.catch((err) => {
		res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
	});
});

router.get('/transactions', authenticate, function (req, res, next) {
	axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
	.then((value) => {
		res.render('./pages/transactions', { title: 'Transaction History', userName: req.session.currentUserName, tokenBal: parseFloat(req.session.tokenBal/10000).toFixed(4), usdBal: parseFloat(req.session.tokenBal/10000).toFixed(4), ethBal: parseFloat(req.session.etherBal).toFixed(4), usdEthBal: parseFloat(req.session.etherBal * value.data.USD).toFixed(4),profileName:req.session.currentUserName, userEmail:req.session.currentUserEmail, etherAddress: req.session.currentUserKey});
	})
	.catch((err) => {
		res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
	});
});

router.get('/send', authenticate, function (req, res, next) {
	axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
	.then((value) => {
		res.render('./pages/send', { title: 'Send GEM/Ether', userName: req.session.currentUserName, tokenBal: parseFloat(req.session.tokenBal/10000).toFixed(4), usdBal: parseFloat(req.session.tokenBal/10000).toFixed(4), ethBal: parseFloat(req.session.etherBal).toFixed(4), usdEthBal: parseFloat(req.session.etherBal * value.data.USD).toFixed(4),profileName:req.session.currentUserName, userEmail:req.session.currentUserEmail, etherAddress: req.session.currentUserKey});
	})
	.catch((err) => {
		res.render('./pages/common', { title: 'Error!', heading: 'Technical Error Occoured!', message: 'We are unable to verify the account due to some technical issues. Please try again.', linkHref: '/', linkText: 'Click Here To Login' });
	});
});

router.get('/logout', function(req, res, next){
	res.render('./pages/common', { title: 'User Logout!', heading: '<span class="LogSucc">Logout Successful!</span>', message: '<span class="LogOuMes">You are successfully logged out. Please visit the login page to re-login.</span>', linkHref: '/', linkText: '<span class="HeLogin">Click Here To Login</span>' });
});

module.exports = router;
