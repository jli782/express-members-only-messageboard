const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  membershipStatus: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
