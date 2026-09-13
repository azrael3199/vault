import mongoose from "mongoose";

const User = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  hashedPassword: {
    required: true,
    type: String,
  },
  salt: {
    required: true,
    type: String,
  },
  recoveryHash: {
    required: true,
    type: String,
  }
});

User.index({ username: 1 }, { unique: true });

export default mongoose.model("User", User);
