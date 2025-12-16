const mongoose = require('mongoose');

const telegramSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sentimentThreshold: { type: Number, default: 8 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TelegramSubscription', telegramSubscriptionSchema);
