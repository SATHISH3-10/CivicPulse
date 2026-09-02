import { createSupabaseModel } from '../db/supabaseModel.js';

/* const evidenceSchema = {
  complaintId: { type: 'uuid', ref: 'Complaint', required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  uploadedBy: { type: 'uuid', ref: 'User', required: true },
  stage: { type: String, enum: ['report', 'before', 'during', 'after'], default: 'report' },
  uploadedAt: { type: Date, default: Date.now }
};

evidenceSchema.index({ complaintId: 1 });

*/
export default createSupabaseModel('Evidence', 'evidence');
