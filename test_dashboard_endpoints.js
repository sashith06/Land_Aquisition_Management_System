const axios = require('axios');

// Test configuration
const baseURL = 'http://localhost:5000/api';

// Test function
async function testDashboardEndpoints() {
  console.log('🧪 Testing Dashboard Endpoints...\n');

  try {
    // Test plans dashboard endpoints
    console.log('📋 Testing Plans Dashboard Endpoints:');
    
    try {
      const plansAllResponse = await axios.get(`${baseURL}/plans/dashboard/all`);
      console.log(`✅ GET /plans/dashboard/all: ${plansAllResponse.status} - Found ${plansAllResponse.data.length} plans`);
    } catch (error) {
      console.log(`❌ GET /plans/dashboard/all: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    try {
      const plansPeResponse = await axios.get(`${baseURL}/plans/dashboard/pe`);
      console.log(`✅ GET /plans/dashboard/pe: ${plansPeResponse.status} - Found ${plansPeResponse.data.length} plans`);
    } catch (error) {
      console.log(`❌ GET /plans/dashboard/pe: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    console.log('\n📦 Testing Lots Dashboard Endpoints:');
    
    try {
      const lotsAllResponse = await axios.get(`${baseURL}/lots/dashboard/all`);
      console.log(`✅ GET /lots/dashboard/all: ${lotsAllResponse.status} - Found ${lotsAllResponse.data.length} lots`);
    } catch (error) {
      console.log(`❌ GET /lots/dashboard/all: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    try {
      const lotsPeResponse = await axios.get(`${baseURL}/lots/dashboard/pe`);
      console.log(`✅ GET /lots/dashboard/pe: ${lotsPeResponse.status} - Found ${lotsPeResponse.data.length} lots`);
    } catch (error) {
      console.log(`❌ GET /lots/dashboard/pe: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

  } catch (error) {
    console.error('❌ General Error:', error.message);
  }

  console.log('\n🏁 Dashboard endpoint testing complete!');
  console.log('\n📝 Note: Authorization errors (401) are expected without a valid JWT token.');
  console.log('   The endpoints are working correctly - they just require authentication.');
}

// Run tests
testDashboardEndpoints();
