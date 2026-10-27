import mongoose from 'mongoose';
const gameSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  sport: { type: String, required: true, trim: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  location: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, default: '', maxlength: 500 },
  maxPlayers: { type: Number, required: true, min: 2, max: 100 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
export default mongoose.model('Game', gameSchema);
