import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, trim: true, maxlength: 80, default: 'General' },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, trim: true, maxlength: 30, default: 'units' },
  reorderLevel: { type: Number, min: 0, default: 5 },
  unitPrice: { type: Number, min: 0, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('InventoryItem', schema);
