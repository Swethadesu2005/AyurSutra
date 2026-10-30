import { Router } from 'express';
import mongoose from 'mongoose';
import InventoryItem from '../models/InventoryItem.js';
import { protect } from '../middleware/auth.js';
const router = Router(); router.use(protect);
router.get('/', async (req, res, next) => { try {
  res.json(await InventoryItem.find({ createdBy: req.user.id }).sort({ name: 1 }).limit(500));
} catch(e) { next(e); } });
router.post('/', async (req, res, next) => { try {
  const { name, category, quantity, unit, reorderLevel, unitPrice } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Item name is required' });
  const item = await InventoryItem.create({ name, category, quantity: Number(quantity ?? 0), unit, reorderLevel: Number(reorderLevel ?? 5), unitPrice: Number(unitPrice ?? 0), createdBy: req.user.id });
  res.status(201).json(item);
} catch(e) { next(e); } });
router.put('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid inventory ID' });
  const item = await InventoryItem.findOneAndUpdate({ _id: req.params.id, createdBy: req.user.id }, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Inventory item not found' });
  res.json(item);
} catch(e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid inventory ID' });
  const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!item) return res.status(404).json({ message: 'Inventory item not found' });
  res.json({ message: 'Inventory item deleted' });
} catch(e) { next(e); } });
export default router;
