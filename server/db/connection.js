import { supabase } from './supabase.js';

const connectDB = async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('Supabase connected');
  } catch (error) {
    console.error(`Supabase Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
