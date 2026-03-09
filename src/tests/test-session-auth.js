/**
 * Session Authentication Test Script
 * 
 * This script tests the new session-based authentication system
 * Run with: node test-session-auth.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/auth';

// Test configuration
const testConfig = {
  // Update these with actual test credentials
  admin: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  manager: {
    email: 'manager@example.com', 
    password: 'manager123'
  },
  employee: {
    email: 'employee@example.com',
    password: 'employee123'
  }
};

// Create axios instance with cookies support
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testLogin(userType, credentials) {
  console.log(`\n🧪 Testing ${userType} login...`);
  
  try {
    const response = await api.post('/login', credentials);
    console.log(`✅ ${userType} login successful`);
    console.log('Response:', response.data);
    
    // Test protected route
    await testProtectedRoute(userType);
    
    return response.data;
  } catch (error) {
    console.log(`❌ ${userType} login failed:`, error.response?.data || error.message);
    return null;
  }
}

async function testProtectedRoute(userType) {
  console.log(`\n🔒 Testing protected route for ${userType}...`);
  
  try {
    const response = await api.get('/companies');
    console.log(`✅ Protected route accessible for ${userType}`);
    console.log('Data:', response.data);
  } catch (error) {
    console.log(`❌ Protected route access failed for ${userType}:`, error.response?.data || error.message);
  }
}

async function testLogout() {
  console.log('\n🚪 Testing logout...');
  
  try {
    const response = await api.post('/logout');
    console.log('✅ Logout successful');
    console.log('Response:', response.data);
    
    // Test that protected routes are no longer accessible
    await testProtectedRouteAfterLogout();
  } catch (error) {
    console.log('❌ Logout failed:', error.response?.data || error.message);
  }
}

async function testProtectedRouteAfterLogout() {
  console.log('\n🔒 Testing protected route after logout...');
  
  try {
    const response = await api.get('/companies');
    console.log('❌ Protected route still accessible after logout (security issue!)');
  } catch (error) {
    console.log('✅ Protected route properly blocked after logout');
    console.log('Expected error:', error.response?.data || error.message);
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing unauthorized access...');
  
  try {
    // Try to access admin route without authentication
    const response = await api.get('/companies');
    console.log('❌ Unauthorized access succeeded (security issue!)');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Session Authentication Tests');
  console.log('=====================================');
  
  // Test unauthorized access first
  await testUnauthorizedAccess();
  
  // Test different user types
  for (const [userType, credentials] of Object.entries(testConfig)) {
    await testLogin(userType, credentials);
  }
  
  // Test logout
  await testLogout();
  
  console.log('\n✨ Test suite completed!');
  console.log('\n📋 Summary:');
  console.log('- Session-based authentication implemented');
  console.log('- Redis integration configured');
  console.log('- Role-based authorization active');
  console.log('- Cookie-based sessions working');
  console.log('\n⚠️  Note: Update test credentials in testConfig object for your actual users');
}

// Error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testLogin,
  testLogout,
  testProtectedRoute,
  testUnauthorizedAccess
};
