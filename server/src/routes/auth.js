import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = Router();

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
}
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});
export default router;
