const mongoose = require('mongoose');

const AlgorithmSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  complexityTime: { type: String, default: 'Varies' },
  complexitySpace: { type: String, default: 'Varies' },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('Algorithm', AlgorithmSchema);
