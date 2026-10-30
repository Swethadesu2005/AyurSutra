import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, min: 0, max: 120, default: null },
  gender: { type: String, enum: ['Female','Male','Other','Prefer not to say'], default: 'Prefer not to say' },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  notes: { type: String, maxlength: 2000, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
schema.index({ createdBy: 1, name: 1 });
export default mongoose.model('Patient', schema);
