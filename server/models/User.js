import { createSupabaseModel } from '../db/supabaseModel.js';

/* const userSchema = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen' },
  city: { type: String, default: 'Chennai' },
  district: { type: String, default: 'Chennai' },
  area: { type: String, default: 'Anna Nagar' },
  departmentId: { type: 'uuid', ref: 'Department' },
  badgeNumber: { type: String, default: '' },
  latitude: { type: Number, default: 13.0827 },
  longitude: { type: Number, default: 80.2707 },
  jurisdictionRadiusKm: { type: Number, default: 5 },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
};

userSchema.index({ role: 1 });
userSchema.index({ district: 1, area: 1 });

*/
export default createSupabaseModel('User', 'users');
