const mongoose = require('mongoose');

const ExecutionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  algorithm: { type: String, required: true },
  operations: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
  inputSummary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExecutionHistory', ExecutionHistorySchema);
