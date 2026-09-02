import { createSupabaseModel } from '../db/supabaseModel.js';

/* const feedbackSchema = {
  complaintId: { type: 'uuid', ref: 'Complaint', required: true },
  citizenId: { type: 'uuid', ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
};

feedbackSchema.index({ complaintId: 1 });

*/
export default createSupabaseModel('Feedback', 'feedback');
