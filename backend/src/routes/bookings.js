import { Router } from 'express';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();

router.get('/mine', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('venue').sort({ date: 1, startTime: 1 });
  res.json({ bookings });
});
router.post('/', requireAuth, async (req, res) => {
  const { venueId, date, startTime, endTime } = req.body;
  if (!venueId || !date || !startTime || !endTime || startTime >= endTime)
    return res.status(400).json({ message: 'Choose a venue, date, and valid start/end times.' });
  if (date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ message: 'Booking date cannot be in the past.' });
  const venue = await Venue.findById(venueId);
  if (!venue) return res.status(404).json({ message: 'Venue not found.' });
  const overlap = await Booking.findOne({ venue: venueId, date, status: 'confirmed', startTime: { $lt: endTime }, endTime: { $gt: startTime } });
  if (overlap) return res.status(409).json({ message: 'That time overlaps an existing booking. Choose another slot.' });
  const booking = await Booking.create({ user: req.user._id, venue: venueId, date, startTime, endTime });
  res.status(201).json({ booking: await booking.populate('venue') });
});
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled';
  await booking.save();
  res.json({ booking });
});
export default router;
