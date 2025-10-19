// Simple token debug utility
console.log('=== TOKEN DEBUG ===');

const token = localStorage.getItem('token');
if (!token) {
  console.log('❌ No token found in localStorage');
} else {
  console.log('✅ Token found');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', {
      id: payload.id,
      role: payload.role,
      exp: payload.exp,
      expired: payload.exp < (Date.now() / 1000),
      iat: payload.iat
    });
    
    console.log('Role check results:');
    console.log('- financial_officer:', payload.role === 'financial_officer');
    console.log('- Financial Officer:', payload.role === 'Financial Officer');  
    console.log('- FO:', payload.role === 'FO');
    
  } catch (e) {
    console.log('❌ Token decode error:', e.message);
  }
}

console.log('=== END DEBUG ===');