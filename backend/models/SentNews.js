const mongoose = require('mongoose');

const sentNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours
});

// Compound index to prevent duplicates
sentNewsSchema.index({ title: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('SentNews', sentNewsSchema);
