const mongoose = require("mongoose");

const subscribedTopicSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const SubscribedTopic = mongoose.model(
  "SubscribedTopic",
  subscribedTopicSchema
);
module.exports = SubscribedTopic;
