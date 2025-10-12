// This script helps clean up any auth-related cookies and storage
// to reset the authentication state when encountering issues

(function cleanupAuth() {
  console.log('🧹 Starting auth cleanup...');
  
  // Clear all cookies related to NextAuth
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.trim().split('=')[0];
    if (name.includes('next-auth')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      console.log(`✓ Cleared cookie: ${name}`);
    }
  });
  
  // Clear local storage items related to auth
  ['next-auth.message', 'next-auth.callback-url', 'next-auth.csrf-token'].forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✓ Cleared localStorage: ${key}`);
    }
  });
  
  // Clear session storage items related to auth
  ['next-auth.message', 'next-auth.callback-url', 'next-auth.csrf-token'].forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`✓ Cleared sessionStorage: ${key}`);
    }
  });
  
  console.log('✅ Auth cleanup complete! Please try signing in again.');
  return true;
})();