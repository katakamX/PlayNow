import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', requireAuth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select('name bio sports skillLevel').limit(100).sort({ name: 1 });
  res.json({ users });
});
router.patch('/profile', requireAuth, async (req, res) => {
  const allowed = ['bio', 'sports', 'skillLevel'];
  for (const key of allowed) if (req.body[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ user: { name: req.user.name, bio: req.user.bio, sports: req.user.sports, skillLevel: req.user.skillLevel } });
});
export default router;
