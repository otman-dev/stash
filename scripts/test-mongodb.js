// test-mongodb.js
// Script to test MongoDB connection

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not defined');
    return;
  }
  
  console.log(`Attempting to connect to: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  });
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // List databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
    // Connect to the specific database
    const dbName = process.env.MONGODB_DB || 'stash';
    const db = client.db(dbName);
    console.log(`\nConnected to database: ${dbName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    if (collections.length === 0) {
      console.log(' - No collections found');
    } else {
      collections.forEach(collection => console.log(` - ${collection.name}`));
    }
    
    console.log('\nConnection test completed successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection();