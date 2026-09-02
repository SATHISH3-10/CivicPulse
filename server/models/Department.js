import { createSupabaseModel } from '../db/supabaseModel.js';

/* const departmentSchema = {
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  head: { type: String, default: '' },
  icon: { type: String, default: '🏢' },
  description: { type: String, default: '' }
};

*/
export default createSupabaseModel('Department', 'departments');
