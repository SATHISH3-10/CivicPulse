import { createSupabaseModel } from '../db/supabaseModel.js';

/* const timelineEventSchema = {
  complaintId: { type: 'uuid', ref: 'Complaint', required: true },
  status: { type: String, required: true },
  message: { type: String, default: '' },
  createdBy: { type: 'uuid', ref: 'User' },
  createdByName: { type: String, default: 'System' },
  department: { type: String, default: '' },
  evidenceUrl: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
};

timelineEventSchema.index({ complaintId: 1, timestamp: 1 });

*/
export default createSupabaseModel('TimelineEvent', 'timeline_events');
