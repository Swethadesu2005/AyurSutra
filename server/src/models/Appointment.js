import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, required: true },
  reason: { type: String, trim: true, maxlength: 500, default: '' },
  status: { type: String, enum: ['Scheduled','Completed','Cancelled'], default: 'Scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export default mongoose.model('Appointment', schema);
