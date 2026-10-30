import { Router } from 'express';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';
const router = Router(); router.use(protect);
router.get('/', async (req, res, next) => { try {
  res.json(await Bill.find({ createdBy: req.user.id }).populate('patient', 'name').sort({ billDate: -1 }).limit(500));
} catch(e) { next(e); } });
router.post('/', async (req, res, next) => { try {
  const { patient, description, amount, status, billDate } = req.body;
  if (!mongoose.isValidObjectId(patient) || amount === '' || amount == null || !Number.isFinite(Number(amount)) || Number(amount) < 0) return res.status(400).json({ message: 'Patient and a valid amount are required' });
  if (!await Patient.findOne({ _id: patient, createdBy: req.user.id })) return res.status(400).json({ message: 'Choose a patient from your patient list' });
  const bill = await Bill.create({ patient, description, amount: Number(amount), status, billDate, createdBy: req.user.id });
  res.status(201).json(await bill.populate('patient', 'name'));
} catch(e) { next(e); } });
router.put('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid bill ID' });
  const item = await Bill.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, req.body, { new: true, runValidators: true }).populate('patient', 'name');
  if (!item) return res.status(404).json({ message: 'Bill not found' });
  res.json(item);
} catch(e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid bill ID' });
  const item = await Bill.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!item) return res.status(404).json({ message: 'Bill not found' });
  res.json({ message: 'Bill deleted' });
} catch(e) { next(e); } });
export default router;
