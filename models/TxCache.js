const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const transactionSchema = new mongoose.Schema({

  address:  {type: String},
  tx: {type: String},
  amount: {type: String},
  currency: {type: String},
  status: {type: Number},
  from: {type: String},
  to: {type: String}

}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })

var Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
