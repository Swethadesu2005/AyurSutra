import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  description: { type: String, trim: true, maxlength: 300, default: 'Consultation' },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Paid','Pending'], default: 'Pending' },
  billDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('Bill', schema);
