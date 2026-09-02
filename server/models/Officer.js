import { createSupabaseModel } from '../db/supabaseModel.js';

/* const officerSchema = {
  userId: { type: 'uuid', ref: 'User', required: true },
  departmentId: { type: 'uuid', ref: 'Department', required: true },
  district: { type: String, default: 'Chennai' },
  area: { type: String, default: 'Anna Nagar' },
  jurisdictionRadiusKm: { type: Number, default: 5 },
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  latitude: { type: Number, default: 13.0827 },
  longitude: { type: Number, default: 80.2707 },
  activeComplaints: { type: Number, default: 0 }
};

officerSchema.index({ userId: 1 });
officerSchema.index({ departmentId: 1 });
officerSchema.index({ district: 1, area: 1 });

*/
export default createSupabaseModel('Officer', 'officers');
