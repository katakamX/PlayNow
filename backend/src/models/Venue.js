import mongoose from 'mongoose';
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  pricePerHour: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  amenities: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export default mongoose.model('Venue', venueSchema);
