// reset-next-auth.js
// This script will clean up the NextAuth.js environment and configuration

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a new strong secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
};

// Update the .env.local file with new secrets
const updateEnvFile = () => {
  console.log('Updating .env.local file with new secrets...');
  
  try {
    // Read the .env.local file
    const envFilePath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Generate new secrets
    const nextAuthSecret = generateSecret();
    
    // Replace the secrets in the file
    envContent = envContent.replace(
      /NEXTAUTH_SECRET=.*/,
      `NEXTAUTH_SECRET=${nextAuthSecret}`
    );
    
    // Also set JWT_SECRET to the same value for consistency
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${nextAuthSecret}`
    );
    
    // Update MongoDB URI format (remove directConnection for SRV URLs)
    envContent = envContent.replace(
      /MONGODB_URI=mongodb\+srv:\/\/mouhib_db_user:Hhk7qIiF5lUjNf2b@farm-cluster-01\.mxvp7p0\.mongodb\.net\/stash\?retryWrites=true&w=majority(&directConnection=true)?/,
      `MONGODB_URI=mongodb+srv://mouhib_db_user:Hhk7qIiF5lUjNf2b@farm-cluster-01.mxvp7p0.mongodb.net/stash?retryWrites=true&w=majority`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('Updated .env.local with new secrets and MongoDB connection string');
  } catch (error) {
    console.error('Error updating .env.local:', error);
  }
};

// Clean up any NextAuth related files that might be causing issues
const cleanupFiles = () => {
  console.log('Cleaning up NextAuth files...');
  
  const filesToDelete = [
    // Add paths to any NextAuth cache files if needed
  ];
  
  filesToDelete.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Deleted: ${file}`);
      }
    } catch (error) {
      console.error(`Error deleting ${file}:`, error);
    }
  });
};

// Main function
const resetNextAuth = () => {
  console.log('Starting NextAuth reset process...');
  
  updateEnvFile();
  cleanupFiles();
  
  console.log('\nNextAuth reset complete! Please:');
  console.log('1. Stop your development server');
  console.log('2. Clear browser cookies and storage for localhost');
  console.log('3. Restart your development server');
  console.log('4. Try signing in again');
};

resetNextAuth();