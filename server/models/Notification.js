import { createSupabaseModel } from '../db/supabaseModel.js';

/* const notificationSchema = {
  userId: { type: 'uuid', ref: 'User', required: true },
  complaintId: { type: 'uuid', ref: 'Complaint' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
};

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

*/
export default createSupabaseModel('Notification', 'notifications');
