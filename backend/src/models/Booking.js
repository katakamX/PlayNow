import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });
bookingSchema.index({ venue: 1, date: 1, startTime: 1, endTime: 1 });
export default mongoose.model('Booking', bookingSchema);
