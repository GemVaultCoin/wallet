var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ipnTransactionsSchema = new Schema({
	email				:		{ type: String, required: true },
	publickey			:		{ type: String, required: true },
	Tokenamount			:		{ type: String, required: true },
	TokenamountRequired	:		{ type: String, required: true },
	paymentMode			:		{ type: String, required: true },
	paymentValue		:		{ type: String, required: true },
	txfee				:		{ type: String, required: true },
	txid				:		{ type: String, required: true },
	paidIn				:		{ type: String, required: true },
	received_amount		:		{ type: String, required: true },
	received_confirms	:		{ type: String, required: true },
	status				:		{ type: String, required: true },
});

var ipntransactions = mongoose.model('ipntransactions', ipnTransactionsSchema);

module.exports = ipntransactions;


