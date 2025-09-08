// Test script to debug message POST issue
const http = require('http');

function testMessagePost() {
  const postData = JSON.stringify({
    recipient_id: 2,
    subject: "Test Message",
    content: "This is a test message to debug the POST issue"
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJwZUBsYW1zLmdvdi5sayIsInJvbGUiOiJwcm9qZWN0X2VuZ2luZWVyIiwiaWF0IjoxNzM2Mjk5OTM2LCJleHAiOjE3MzYzODYzMzZ9.dummy-token',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Sending POST request to:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('Post data:', postData);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response:', responseData);
      if (res.statusCode === 200) {
        console.log('✅ Success!');
      } else {
        console.log('❌ Error response');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing message POST endpoint...');
testMessagePost();
