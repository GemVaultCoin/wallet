var express 		=	require('express');
var router 			=	express.Router();
var authenticate 	=	require('../authentication');

var UserController 			=	require('../api/userController');
var AuthController 			=	require('../api/authController');
var TokenController 		=	require('../api/TokenController');

router.get('/logout', AuthController.logoutUser);
router.post('/userlogin',AuthController.userLogin);
router.post('/ipnhandler',TokenController.creditToken);
router.post('/usersignup',AuthController.userSignUp);
router.post('/buytoken',authenticate, TokenController.buyToken);
router.post('/sendcurrency',authenticate, TokenController.sendCurrency);
router.post('/backupwallet',authenticate, TokenController.backupPrivateKey);
router.get('/gettokentrans',authenticate, TokenController.getTokenTransaction);
router.post('/forgotpassword',UserController.sendPasswordRecoveryEmail);
router.post('/resetpassword',UserController.resetPasswordAndSave);
router.get('/getuserdetails',authenticate, UserController.getUserDetails);
router.post('/editprofile',authenticate, UserController.editUserProfile);
router.get('/gettokensale', authenticate, TokenController.getTokenDetails);
router.get('/activate/:token',UserController.verifyAccountByEmail)
router.get('/recovery/:token',UserController.forgotPasswordIndex)
router.post('/getEmailActivationLink',UserController.getEmailActivationLink)
module.exports = router;
