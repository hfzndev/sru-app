import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the employee name'],
  },
  crew: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: [true, 'Please provide the crew assignment'],
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
  },
  years: {
    type: Number,
    required: [true, 'Please provide years of service'],
  },
  bio: {
    type: String,
    required: [true, 'Please provide a short biography'],
  },
  imageBase64: {
    type: String,
    default: "",
  }
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
