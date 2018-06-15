var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var pkSchema = new Schema({
	pktxt: { type: String, required: true },
	pkcrypt: { type: String, required: true },
	uid: { type: String, required: true },
	pubkey: { type: String, required: true }
});

var pk = mongoose.model('pk', pkSchema);

module.exports = pk;
