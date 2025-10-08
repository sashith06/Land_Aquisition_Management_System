// Quick Test Script for Land Valuation Feature
// Copy this to browser console or run with Node.js

console.log('🧪 Testing Land Valuation Feature...\n');

// Test Configuration
const BASE_URL = 'http://localhost:5000';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token from localStorage

// Helper function to make API calls
async function testEndpoint(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

// Test 1: Check if projects endpoint is accessible
async function test1_getProjects() {
  console.log('Test 1: GET /api/land-valuation/projects');
  const result = await testEndpoint('GET', '/api/land-valuation/projects');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  console.log('✓ Projects count:', result.data?.projects?.length || 0);
  console.log('---\n');
  return result;
}

// Test 2: Check if calculate endpoint works (needs project ID)
async function test2_calculateValuation(projectId) {
  console.log(`Test 2: POST /api/land-valuation/projects/${projectId}/calculate`);
  const result = await testEndpoint('POST', `/api/land-valuation/projects/${projectId}/calculate`);
  console.log('Status:', result.status);
  if (result.data?.success) {
    console.log('✓ Total Value:', result.data.valuation?.totalValue);
    console.log('✓ Plans Count:', result.data.valuation?.plans?.length);
    console.log('✓ Locations:', result.data.valuation?.locations);
  } else {
    console.log('Error:', result.data?.message);
  }
  console.log('---\n');
  return result;
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Tests...\n');
  
  // Test 1: Get projects
  const projectsResult = await test1_getProjects();
  
  // Test 2: Calculate valuation for first project (if available)
  if (projectsResult.data?.projects?.length > 0) {
    const firstProjectId = projectsResult.data.projects[0].id;
    await test2_calculateValuation(firstProjectId);
  } else {
    console.log('⚠️ No projects available for valuation test\n');
  }
  
  console.log('✅ Tests completed!\n');
  console.log('📝 Summary:');
  console.log('- Backend: Running on port 5000');
  console.log('- Frontend: Running on port 5173');
  console.log('- API Endpoint: /api/land-valuation/*');
}

// Instructions
console.log('📋 INSTRUCTIONS:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Login as Chief Engineer or Project Engineer');
console.log('4. In console, type: localStorage.getItem("token")');
console.log('5. Copy the token value');
console.log('6. Replace TOKEN variable above with your token');
console.log('7. Run: runTests()');
console.log('\n');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, testEndpoint };
}
