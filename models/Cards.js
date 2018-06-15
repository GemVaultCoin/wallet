var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var cardSchema = new Schema({
	mask: { type: String, required: true },
	number: { type: String, required: true },
	name: { type: String, required: true },
	cvc: { type: String, default: null },
	expire: { type: String, required: true },
  userid: { type: String, required: true },
	status:	{ type: String, required: true },
	deleted:	{ type: Boolean, required: true }
});

var card = mongoose.model('card', cardSchema);

module.exports = card;
