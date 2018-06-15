var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	name				:		{ type: String, required: true },
	email				:		{ type: String, required: true },
	avatar				:		{ type: String , default: null},
	password			:		{ type: String, required: true },
	passphrase			:		{ type: String, required: true },
	mobile				:		{ type: String, default: null },
	publickey			:		{ type: String, unique: true, required: true },
	country				:		{ type: String , default: null},
	phonecode			:		{ type: String , default: null},
	time				:		{ type: Date, default: Date.now },
	status				:		{type: Boolean, default: false},//user active==true
	deleted				:		{type: Boolean, default: false},//user deleted if true
	admin				:		{type: Boolean, default: false},//admin if true
	emailerToken		:		{ type: String ,default: null},
	linkExpires			:		{ type: Date ,default: null},
	resetPasswordToken	:		{ type: String ,default: null},
	resetPasswordExpires:		{ type: Date ,default: null},
	otp					:		{ type: String ,default: null},
	twofAuthSecret		:		{ type: String ,default: null},
	twofAuthStatus		:		{type: Boolean, default: false},
	twofAuthDate		:		{ type: Date, default: null},
	otpauth_url			:		{ type: String ,default: null},
	tempemail			:		{ type: String, default: null },
	tempemailExpires	:		{ type: Date ,default: null},
	tempemailToken		:		{ type: String ,default: null},
	currentCard : {type: String, default: null}
});

var user = mongoose.model('user', userSchema);

module.exports = user;
