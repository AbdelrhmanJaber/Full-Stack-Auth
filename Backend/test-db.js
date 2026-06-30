const mongoose = require('mongoose');

// Read connection parameters from environment or fallback to .env configuration
const rootUser = process.env.MONGO_ROOT_USER || 'admin_user';
const rootPass = process.env.MONGO_ROOT_PASSWORD || 'super_secure_mongodb_password_123';
const dbName = process.env.MONGO_DB_NAME || 'easygenerator_assessment';

// Use localhost since we are executing this script on the host machine connecting to the forwarded port
const uri = `mongodb://${rootUser}:${rootPass}@localhost:27017/${dbName}?authSource=admin`;

async function testConnection() {
  console.log(`Connecting to MongoDB at: mongodb://${rootUser}:****@localhost:27017/${dbName}?authSource=admin`);
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('SUCCESS: Connected to MongoDB container successfully!');

    // Define a temporary schema & model
    const TestSchema = new mongoose.Schema({ 
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('ConnectionTest', TestSchema);

    // 1. Write operation
    console.log('TEST 1/3: Writing test document...');
    const doc = new TestModel({ name: 'Docker Compose Connection Test' });
    await doc.save();
    console.log(`-> Document saved with ID: ${doc._id}`);

    // 2. Read operation
    console.log('TEST 2/3: Reading test document back...');
    const found = await TestModel.findOne({ name: 'Docker Compose Connection Test' });
    if (found) {
      console.log(`-> Document successfully retrieved: "${found.name}" (created at ${found.timestamp})`);
    } else {
      throw new Error('Retrieved document was empty or not found.');
    }

    // 3. Clean up (Delete operation)
    console.log('TEST 3/3: Cleaning up test document...');
    const deleteResult = await TestModel.deleteOne({ _id: found._id });
    console.log(`-> Deleted ${deleteResult.deletedCount} document(s).`);

    // Clean up collection
    await mongoose.connection.db.dropCollection('connectiontests');

    await mongoose.disconnect();
    console.log('\nSTATUS: Database connections and operations are working correctly!');
    process.exit(0);
  } catch (err) {
    console.error('\nERROR: Database test failed!', err.message);
    process.exit(1);
  }
}

testConnection();
