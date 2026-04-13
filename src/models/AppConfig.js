import mongoose from 'mongoose';

const AppConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);
