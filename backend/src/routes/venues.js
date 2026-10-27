import { Router } from 'express';
import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.sport) filter.sport = new RegExp(String(req.query.sport).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (req.query.search) filter.$or = ['name', 'location'].map(k => ({ [k]: new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
  res.json({ venues: await Venue.find(filter).sort({ createdAt: -1 }).limit(100) });
});
router.get('/:id', async (req, res) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) return res.status(404).json({ message: 'Venue not found.' });
  const bookings = await Booking.find({ venue: venue._id, status: 'confirmed' }).select('date startTime endTime');
  res.json({ venue, bookings });
});
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, sport, location, pricePerHour } = req.body;
  if (!name || !sport || !location || !Number.isFinite(Number(pricePerHour)) || Number(pricePerHour) < 0)
    return res.status(400).json({ message: 'Name, sport, location and a valid price are required.' });
  const venue = await Venue.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ venue });
});
export default router;
