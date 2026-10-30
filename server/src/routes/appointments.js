import { Router } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';
const router = Router(); router.use(protect);
router.get('/', async (req, res, next) => { try {
  res.json(await Appointment.find({ createdBy: req.user.id }).populate('patient', 'name phone').sort({ date: 1 }).limit(500));
} catch(e) { next(e); } });
router.post('/', async (req, res, next) => { try {
  const { patient, date, reason, status } = req.body;
  if (!mongoose.isValidObjectId(patient) || !date) return res.status(400).json({ message: 'Patient and date are required' });
  const owned = await Patient.findOne({ _id: patient, createdBy: req.user.id });
  if (!owned) return res.status(400).json({ message: 'Choose a patient from your patient list' });
  const appointment = await Appointment.create({ patient, date, reason, status, createdBy: req.user.id });
  res.status(201).json(await appointment.populate('patient', 'name phone'));
} catch(e) { next(e); } });
router.put('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid appointment ID' });
  const update = { ...req.body };
  if (update.patient) {
    const owned = await Patient.findOne({ _id: update.patient, createdBy: req.user.id });
    if (!owned) return res.status(400).json({ message: 'Invalid patient' });
  }
  const item = await Appointment.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, update, { new: true, runValidators: true }).populate('patient', 'name phone');
  if (!item) return res.status(404).json({ message: 'Appointment not found' });
  res.json(item);
} catch(e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid appointment ID' });
  const item = await Appointment.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!item) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ message: 'Appointment deleted' });
} catch(e) { next(e); } });
export default router;
