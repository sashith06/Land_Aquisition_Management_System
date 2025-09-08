const axios = require('axios');

// Test the fixed project deletion
async function testProjectDeletion() {
  const baseURL = 'http://localhost:5000';
  
  try {
    // First, let's login as a project engineer to get a token
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'engineer@lams.gov.lk', // Replace with actual PE credentials
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Get list of projects to see what we can delete
    const projectsResponse = await axios.get(`${baseURL}/api/projects/approved`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Available projects:', projectsResponse.data.length);
    
    // Find a project created by this user
    const myProjects = projectsResponse.data.filter(p => p.can_delete);
    
    if (myProjects.length === 0) {
      console.log('❌ No deletable projects found for this user');
      return;
    }
    
    const projectToDelete = myProjects[0];
    console.log(`🎯 Testing deletion of project: ${projectToDelete.name} (ID: ${projectToDelete.id})`);
    
    // Try to delete the project
    const deleteResponse = await axios.delete(`${baseURL}/api/projects/delete/${projectToDelete.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Project deleted successfully:', deleteResponse.data.message);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run the test
console.log('🧪 Testing improved project deletion...');
testProjectDeletion();
