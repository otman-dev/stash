// reset-auth-script.js
// Run this script in the browser console to clear all authentication cookies and storage

console.log("Clearing authentication data...");

// Clear all cookies
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Clear local storage
localStorage.clear();

// Clear session storage
sessionStorage.clear();

// Reload the page
console.log("Authentication data cleared. Reloading page...");
setTimeout(() => {
  window.location.href = "/login";
}, 500);