import mongoose from "mongoose";

const File = new mongoose.Schema({
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
  key: {
    required: true,
    type: String,
  },
  iv: {
    required: true,
    type: String,
  },
  isFavorite: {
    required: true,
    type: Boolean,
  },
});

export default mongoose.model("File", File);
