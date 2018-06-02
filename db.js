var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/'+process.env.COINNAME,{useMongoClient:true},(error,response) =>{
    if (!response){
        return console.log('Unable To Connect To MongoDB Local');
    }
    console.log('Connected To MongoDB local');
});

//Defining New Schema
var FinalUserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	salt: { type: String, required: true },
	serversalt: { type: String, required: true },
	activated: { type: Boolean, required: true },
	publickey: { type: String, unique: true, required: true },
	passphrase: { type: String, required: true },
	phonenumber: { type: String },
	phonCode: { type: String },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date },
	activationToken: { type: String },
	activationLinkExpires: { type: Date },
	disableLogin: {type: Boolean, default: false},
});

var Transactions = new mongoose.Schema({
	email: { type: String, required: true },
	publickey: { type: String, required: true },
	amount: { type: String, required: true },
	valueusd: { type: String, required: true },
	paymentmode: { type: String, required: true },
	paymentval: { type: String, required: true },
	txfee: { type: String, required: true },
	txid: { type: String, required: true },
	status:{type:String}
});

var FinalUserDB = mongoose.model('final-signup-data', FinalUserSchema);

var TransactionDB = mongoose.model('transactions', Transactions);

module.exports = {
	FinalUserDB,
	TransactionDB
};
