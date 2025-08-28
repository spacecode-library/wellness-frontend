#!/usr/bin/env node

/**
 * Simple Backend Health Check
 */

const http = require('http');
const { URL } = require('url');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8005';

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = body ? JSON.parse(body) : {};
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            status: res.statusCode,
            body: body
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            body: body,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        status: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        status: 0
      });
    });
    
    req.end();
  });
}

async function testBackendHealth() {
  console.log('🏥 Backend Health Check');
  console.log(`🔗 Testing: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  // Test 1: Basic health endpoint
  console.log('1. Testing health endpoint...');
  const healthResponse = await makeRequest('/health');
  console.log(`   Status: ${healthResponse.status}`);
  console.log(`   Success: ${healthResponse.success}`);
  if (healthResponse.error) {
    console.log(`   Error: ${healthResponse.error}`);
    return false;
  }
  if (healthResponse.body) {
    console.log(`   Response: ${healthResponse.body.substring(0, 200)}`);
  }
  
  // Test 2: API base endpoint
  console.log('\n2. Testing API base endpoint...');
  const apiResponse = await makeRequest('/api');
  console.log(`   Status: ${apiResponse.status}`);
  console.log(`   Success: ${apiResponse.success}`);
  if (apiResponse.error) {
    console.log(`   Error: ${apiResponse.error}`);
  }
  if (apiResponse.body) {
    console.log(`   Response: ${apiResponse.body.substring(0, 200)}`);
  }
  
  // Test 3: Check if backend is accessible
  console.log('\n3. Basic connectivity test...');
  const basicResponse = await makeRequest('/');
  console.log(`   Status: ${basicResponse.status}`);
  console.log(`   Success: ${basicResponse.success}`);
  if (basicResponse.error) {
    console.log(`   Error: ${basicResponse.error}`);
    return false;
  }
  
  console.log('\n✅ Backend appears to be running and accessible');
  return true;
}

if (require.main === module) {
  testBackendHealth().then(isHealthy => {
    if (isHealthy) {
      console.log('\n🎉 Backend is healthy! You can now run the check-in tests.');
    } else {
      console.log('\n❌ Backend is not accessible. Please check if the server is running.');
      console.log('💡 Make sure the wellness-backend is running on port 8005');
    }
  }).catch(console.error);
}