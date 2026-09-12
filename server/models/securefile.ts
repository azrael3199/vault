import mongoose from "mongoose";

const SecureFile = new mongoose.Schema({
  userId: {
    required: true,
    type: String,
  },
  filename: {
    required: true,
    type: String,
  },
  uploadedAt: {
    required: true,
    type: Date,
  },
  content: {
    required: true,
    type: Buffer,
  },
  type: {
    required: true,
    type: String,
  },
  size: {
    required: true,
    type: Number,
  },
  encryptedKey: {
    required: true,
    type: String,
  },
  keyIv: {
    required: true,
    type: String,
  },
  keyAuthTag: {
    required: true,
    type: String,
  },
  fileIv: {
    required: true,
    type: String,
  },
  fileAuthTag: {
    required: true,
    type: String,
  },
  isFavorite: {
    required: true,
    type: Boolean,
  },
});

export default mongoose.model("SecureFile", SecureFile);
