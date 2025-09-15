import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  tokenName: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  imageurl: { type: String },
  imagepath: { type: String },
  filename: { type: String },
  mimetype: { type: String },
  size: { type: String },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

export default mongoose.model('Token', TokenSchema);
