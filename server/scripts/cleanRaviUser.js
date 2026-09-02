import connectDB from '../db/connection.js';
import User from '../models/User.js';

async function cleanRavi() {
  await connectDB();
  console.log('Cleaning up Ravi dummy accounts...');

  const raviUsers = await User.find({
    $or: [
      { name: { $regex: 'Ravi', $options: 'i' } },
      { email: 'citizen@civicpulse.demo' }
    ]
  });

  console.log(`Found ${raviUsers.length} matching user(s).`);

  for (const user of raviUsers) {
    if (user.name?.toLowerCase().includes('ravi')) {
      console.log(`Renaming user ${user._id} (${user.name}) -> Citizen User`);
      await User.findOneAndUpdate({ _id: user._id }, { name: 'Citizen User' });
    }
  }

  console.log('Cleanup complete!');
  process.exit(0);
}

cleanRavi().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
