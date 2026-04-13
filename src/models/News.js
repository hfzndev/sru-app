import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  content: {
    type: String,
    required: [true, 'Please provide the news content'],
  },
  date: {
    type: String,
    required: [true, 'Please provide a string date for display (e.g. "OCT 20, 2025")'],
  }
}, { timestamps: true });

export default mongoose.models.News || mongoose.model('News', newsSchema);
