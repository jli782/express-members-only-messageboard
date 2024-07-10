const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

messageSchema.virtual("formatted_timestamp").get(function () {
  return this.timestamp.toLocaleString(DateTime.DATETIME_HUGE);
});
module.exports = mongoose.model("Message", messageSchema);
