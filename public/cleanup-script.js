// cleanup-script.js
// Run this in your browser's console to clean up authentication cookies

console.log('Cleaning up NextAuth.js cookies and storage...');

// Clear all cookies related to next-auth
document.cookie.split(';').forEach(function(c) {
  if (c.trim().startsWith('next-auth.')) {
    const cookieName = c.trim().split('=')[0];
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`Cleared cookie: ${cookieName}`);
  }
});

// Clear session storage
if (sessionStorage.getItem('next-auth.session-token')) {
  sessionStorage.removeItem('next-auth.session-token');
  console.log('Cleared session storage');
}

// Clear local storage
if (localStorage.getItem('next-auth.session-token')) {
  localStorage.removeItem('next-auth.session-token');
  console.log('Cleared local storage');
}

console.log('Cleanup complete! Please refresh the page and try signing in again.');