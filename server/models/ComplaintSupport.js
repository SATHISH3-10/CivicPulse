import { createSupabaseModel } from '../db/supabaseModel.js';

/* const complaintSupportSchema = {
  complaintId: { type: 'uuid', ref: 'Complaint', required: true },
  userId: { type: 'uuid', ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
};

complaintSupportSchema.index({ complaintId: 1, userId: 1 }, { unique: true });

*/
export default createSupabaseModel('ComplaintSupport', 'complaint_support');
