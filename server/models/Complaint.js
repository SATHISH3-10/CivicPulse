import { createSupabaseModel } from '../db/supabaseModel.js';

/*
const complaintSchema = {
  complaintId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  priority: { type: String, enum: ['P1', 'P2', 'P3', 'P4'], default: 'P3' },
  status: {
    type: String,
    enum: ['submitted', 'ai_analyzed', 'assigned', 'officer_accepted', 'in_progress', 'resolution_submitted', 'awaiting_verification', 'resolved', 'reopened', 'escalated'],
    default: 'submitted'
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, default: '' },
  district: { type: String, default: 'Chennai' },
  area: { type: String, default: '' },
  citizenId: { type: 'uuid', ref: 'User', required: true },
  departmentId: { type: 'uuid', ref: 'Department' },
  officerId: { type: 'uuid', ref: 'User' },
  aiScore: { type: Number, default: 0 },
  duplicateProbability: { type: Number, default: 0 },
  slaDeadline: { type: Date },
  supportCount: { type: Number, default: 0 },
  resolutionNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

complaintSchema.index({ citizenId: 1 });
complaintSchema.index({ officerId: 1 });
complaintSchema.index({ departmentId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ district: 1, area: 1 });
complaintSchema.index({ latitude: 1, longitude: 1 });
complaintSchema.index({ createdAt: -1 });

*/
export default createSupabaseModel('Complaint', 'complaints');
