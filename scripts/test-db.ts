import dbConnect from '../lib/db';
import User from '../models/User';
import mongoose from 'mongoose';

async function main() {
  console.log('--- MongoDB Connection & Initialization Test ---');
  console.log('Target URI:', process.env.MONGODB_URI);

  try {
    // 1. Establish connection
    console.log('\nConnecting to MongoDB...');
    await dbConnect();
    console.log('✓ Successfully connected to MongoDB!');

    // 2. Perform a test write (databases in Mongo are created lazily on first insert)
    const testEmail = 'test-admin@devopsplatform.local';
    
    console.log(`\nChecking if test user exists: ${testEmail}...`);
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('No test user found. Creating one to initialize database...');
      user = await User.create({
        name: 'System Administrator',
        email: testEmail,
        password: 'temporarypassword123', // Just a placeholder
        role: 'admin',
      });
      console.log('✓ Test user created successfully:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('✓ Test user already exists in database:');
      console.log(JSON.stringify(user, null, 2));
    }

    console.log('\n======================================================');
    console.log('SUCCESS: The database and collections have been created!');
    console.log('You can now see the "devops-resource-management" database');
    console.log('in your MongoDB Compass or local mongo shell.');
    console.log('======================================================');

  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to or query MongoDB.');
    console.error('Please make sure your MongoDB server is running locally on port 27017');
    console.error('or that your MONGODB_URI in .env.local is correct.');
    console.error('\nTechnical Error details:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

main();
