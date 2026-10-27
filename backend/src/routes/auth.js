import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const makeToken = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: '7d' });
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, sports: user.sports, skillLevel: user.skillLevel });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ message: 'Name, email and a password of at least 8 characters are required.' });
    const normalizedEmail = String(email).toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'Email is already registered.' });
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) { res.status(500).json({ message: 'Could not register user.' }); }
});
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: makeToken(user), user: publicUser(user) });
});
router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
