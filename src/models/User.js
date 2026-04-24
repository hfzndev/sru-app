import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'pending', 'guest'],
    default: 'pending',
  },
  profilePictureBase64: {
    type: String,
    default: "",
  }
}, { timestamps: true });

// Avoid OverwriteModelError in Next.js
export default mongoose.models.User || mongoose.model('User', UserSchema);
