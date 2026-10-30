import { Router } from 'express';
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.use(protect);
router.get('/', async (req, res, next) => { try {
  const patients = await Patient.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).limit(500);
  res.json(patients);
} catch(e) { next(e); } });
router.post('/', async (req, res, next) => { try {
  const { name, age, gender, phone, email, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Patient name is required' });
  const patient = await Patient.create({ name, age: age === '' || age == null ? null : Number(age), gender, phone, email, notes, createdBy: req.user.id });
  res.status(201).json(patient);
} catch(e) { next(e); } });
router.put('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid patient ID' });
  const patient = await Patient.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
} catch(e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid patient ID' });
  const patient = await Patient.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient deleted' });
} catch(e) { next(e); } });
export default router;
