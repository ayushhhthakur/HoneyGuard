import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  token: { type: String },
  type: { type: String },
  message: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  status: { type: String },
  created_at: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

export default mongoose.model('Alert', AlertSchema);
