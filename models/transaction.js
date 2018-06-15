var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var transactionSchema = new Schema({
	from		: 	String,
	to			: 	String,
	time		: 	{ type: Date, default: Date.now },
	amount		: 	String
});
var transaction = mongoose.model('transaction', transactionSchema);

module.exports = transaction;


