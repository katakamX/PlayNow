import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please log in first.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development_only_change_me');
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User no longer exists.' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}
