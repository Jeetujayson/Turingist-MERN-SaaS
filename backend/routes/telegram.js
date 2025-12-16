const express = require('express');
const router = express.Router();
const TelegramSubscription = require('../models/TelegramSubscription');

// Subscribe to Telegram alerts
router.post('/subscribe', async (req, res) => {
  try {
    const { chatId, sentimentThreshold } = req.body;
    const userId = req.user?.id;

    // Check if subscription already exists and update it
    const existingSubscription = await TelegramSubscription.findOne({ chatId });
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.sentimentThreshold = sentimentThreshold || 8;
      existingSubscription.isActive = true;
      await existingSubscription.save();
      return res.json({ success: true, message: 'Subscription updated successfully!' });
    }

    // Create new subscription
    const subscription = new TelegramSubscription({
      userId,
      chatId,
      sentimentThreshold: sentimentThreshold || 8
    });

    await subscription.save();
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Unsubscribe from alerts
router.post('/unsubscribe', async (req, res) => {
  try {
    const { chatId } = req.body;
    await TelegramSubscription.findOneAndUpdate(
      { chatId },
      { isActive: false }
    );
    res.json({ success: true, message: 'Unsubscribed successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
