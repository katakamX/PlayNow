import { Router } from 'express';
import Game from '../models/Game.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', async (_req, res) => {
  const games = await Game.find({ date: { $gte: new Date().toISOString().slice(0, 10) } })
    .populate('creator', 'name skillLevel').populate('players', 'name skillLevel').populate('venue', 'name location')
    .sort({ date: 1, time: 1 }).limit(100);
  res.json({ games });
});
router.post('/', requireAuth, async (req, res) => {
  const { title, sport, location, date, time, maxPlayers } = req.body;
  if (!title || !sport || !location || !date || !time || Number(maxPlayers) < 2)
    return res.status(400).json({ message: 'Title, sport, location, date, time and at least 2 players are required.' });
  const game = await Game.create({ ...req.body, maxPlayers: Number(maxPlayers), creator: req.user._id, players: [req.user._id] });
  res.status(201).json({ game: await game.populate('creator', 'name skillLevel') });
});
router.post('/:id/join', requireAuth, async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found.' });
  if (game.players.some(id => id.equals(req.user._id))) return res.status(409).json({ message: 'You have already joined this game.' });
  if (game.players.length >= game.maxPlayers) return res.status(409).json({ message: 'This game is full.' });
  game.players.push(req.user._id);
  await game.save();
  res.json({ game: await game.populate('players', 'name skillLevel') });
});
export default router;
