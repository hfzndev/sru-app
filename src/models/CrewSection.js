import mongoose from 'mongoose';

const CrewWorkerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true, default: 'present' }
});

const CrewSectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sub: { type: String, required: true },
  workers: [CrewWorkerSchema]
}, { timestamps: true });

export default mongoose.models.CrewSection || mongoose.model('CrewSection', CrewSectionSchema);
