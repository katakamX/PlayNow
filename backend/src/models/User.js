import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio: { type: String, default: '', maxlength: 300 },
  sports: [{ type: String, maxlength: 40 }],
  skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
