import mongoose from 'mongoose';

const TokenLogSchema = new mongoose.Schema({
  token: { type: String, required: true },
  event: { type: String, required: true },
  status: { type: String, required: true },
  ip_address: { type: String },
  user_agent: { type: String },
  os: { type: String },
  browser: { type: String },
  device: { type: String },
  country: { type: String },
  region: { type: String },
  city: { type: String },
  timezone: { type: String },
  isp: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

export default mongoose.model('TokenLog', TokenLogSchema);
