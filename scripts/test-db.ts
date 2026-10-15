import dbConnect from '../lib/db';
import User from '../models/User';
import mongoose from 'mongoose';
import { hashPassword } from '../lib/auth';

async function main() {
  console.log('--- MongoDB Connection & Initialization Test ---');
  console.log('Target URI:', process.env.MONGODB_URI || process.env.MONGO_URI);

  try {
    console.log('\nConnecting to MongoDB...');
    await dbConnect();
    console.log('✓ Successfully connected to MongoDB!');

    const defaultAdminEmail = 'admin@devopsplatform.local';
    const defaultAdminPassword = await hashPassword('admin');

    console.log(`\nChecking if default admin exists: ${defaultAdminEmail}...`);
    let user = await User.findOne({ email: defaultAdminEmail });

    if (!user) {
      console.log('No default admin found. Creating the default admin user...');
      user = await User.create({
        name: 'System Administrator',
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        role: 'admin',
      });
      console.log('✓ Default admin created successfully.');
    } else {
      console.log('✓ Default admin already exists in database.');
    }

    console.log('\n======================================================');
    console.log('SUCCESS: The database and default admin user are ready!');
    console.log('Default login credentials:');
    console.log(`Email: ${defaultAdminEmail}`);
    console.log('Password: admin');
    console.log('======================================================');
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to or query MongoDB.');
    console.error('Please make sure your MongoDB server is running locally on port 27017');
    console.error('or that your MONGODB_URI in .env.local is correct.');
    console.error('\nTechnical Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

main();
