#!/usr/bin/env node

/**
 * Simple Backend Check-in API Test Script (No Dependencies)
 * Tests the check-in functionality using native Node.js modules
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:8005/api';

// Try multiple test users - backend might have different test accounts
const TEST_USERS = [
  { email: 'test.new@example.com', password: 'password123' },
  { email: 'test@example.com', password: 'password123' },
  { email: 'employee@example.com', password: 'password123' },
  { email: 'admin@example.com', password: 'admin123' }
];

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (message) console.log(`    ${message}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(60)}`);
}

function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = httpModule.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
            status: res.statusCode
          });
        } catch (error) {
          resolve({
            success: false,
            error: `Parse error: ${error.message}`,
            status: res.statusCode,
            body: body
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function authenticateUser() {
  logSection('AUTHENTICATION TEST');
  
  // Try each test user until one works
  for (const testUser of TEST_USERS) {
    console.log(`🔑 Trying to authenticate: ${testUser.email}`);
    
    const loginResponse = await makeRequest('POST', '/auth/login', testUser);
    
    if (loginResponse.success && loginResponse.data.success) {
      logTest('User Login', true, `Authenticated as ${testUser.email}`);
      return { token: loginResponse.data.data.accessToken, user: testUser };
    } else {
      console.log(`   ❌ Failed: ${loginResponse.data?.message || loginResponse.error}`);
    }
  }
  
  // If all failed, try to register a new test user
  console.log('🔑 All existing users failed, trying to register new test user...');
  
  const newUser = {
    name: 'Test User',
    email: 'checkin-test@example.com',
    password: 'Test123!',
    department: 'Engineering',
    role: 'employee'
  };
  
  const registerResponse = await makeRequest('POST', '/auth/register', newUser);
  
  console.log('Registration response:', {
    success: registerResponse.success,
    status: registerResponse.status,
    data: registerResponse.data,
    error: registerResponse.error
  });
  
  if (registerResponse.success && registerResponse.data.success) {
    console.log(`   ✅ Registered new user: ${newUser.email}`);
    
    // Now try to login with the new user
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: newUser.email,
      password: newUser.password
    });
    
    console.log('Login after registration:', {
      success: loginResponse.success,
      status: loginResponse.status,
      data: loginResponse.data,
      error: loginResponse.error
    });
    
    if (loginResponse.success && loginResponse.data.success) {
      logTest('User Registration & Login', true, `Created and authenticated as ${newUser.email}`);
      return { token: loginResponse.data.data.accessToken, user: newUser };
    }
  } else {
    console.log(`   ❌ Registration failed: ${registerResponse.data?.message || registerResponse.error}`);
  }
  
  logTest('User Authentication', false, 'Could not authenticate with any test user');
  return null;
}

async function testTodayCheckInStatus(token) {
  logSection('TODAY\'S CHECK-IN STATUS TEST');
  
  console.log('📋 Checking today\'s check-in status...');
  const response = await makeRequest('GET', '/checkins/today', null, token);
  
  console.log('Response details:', {
    success: response.success,
    status: response.status,
    data: response.data
  });
  
  if (response.success && response.data.success) {
    const data = response.data.data;
    
    // Test response structure
    const hasRequiredFields = data.hasOwnProperty('checkedInToday') && 
                             data.hasOwnProperty('canCheckIn') &&
                             data.hasOwnProperty('nextCheckIn');
    
    logTest('Response Structure', hasRequiredFields, 
      `Has required fields: checkedInToday, canCheckIn, nextCheckIn`);
    
    // Test response values
    logTest('Response Values', 
      typeof data.checkedInToday === 'boolean' && 
      typeof data.canCheckIn === 'boolean',
      `checkedInToday: ${data.checkedInToday}, canCheckIn: ${data.canCheckIn}`);
    
    if (data.checkedInToday && data.checkIn) {
      // Test check-in object structure
      const checkIn = data.checkIn;
      const hasCheckInFields = checkIn.hasOwnProperty('id') &&
                              checkIn.hasOwnProperty('mood') &&
                              checkIn.hasOwnProperty('moodLabel') &&
                              checkIn.hasOwnProperty('date') &&
                              checkIn.hasOwnProperty('happyCoinsEarned');
      
      logTest('Check-in Object Structure', hasCheckInFields,
        `Check-in has required fields: id, mood, moodLabel, date, happyCoinsEarned`);
      
      logTest('Mood Value', 
        Number.isInteger(checkIn.mood) && checkIn.mood >= 1 && checkIn.mood <= 5,
        `Mood: ${checkIn.mood} (should be 1-5)`);
        
      console.log('📋 Current check-in data:', {
        id: checkIn.id,
        mood: checkIn.mood,
        moodLabel: checkIn.moodLabel,
        feedback: checkIn.feedback,
        happyCoinsEarned: checkIn.happyCoinsEarned
      });
    } else {
      console.log('📋 No check-in completed today');
    }
    
    return data;
  } else {
    logTest('Get Today Status', false, `API Error: ${JSON.stringify(response.error || response.data)}`);
    return null;
  }
}

async function testCheckInSubmission(token, todayStatus) {
  logSection('CHECK-IN SUBMISSION TEST');
  
  // If user has already checked in today, test duplicate submission
  if (todayStatus && todayStatus.checkedInToday) {
    console.log('📋 User has already checked in today - testing duplicate submission...');
    
    const duplicateResponse = await makeRequest('POST', '/checkins', {
      mood: 4,
      feedback: 'Duplicate test submission',
      source: 'web'
    }, token);
    
    console.log('Duplicate submission response:', {
      success: duplicateResponse.success,
      status: duplicateResponse.status,
      data: duplicateResponse.data
    });
    
    // Should return 409 Conflict
    logTest('Duplicate Check-in Prevention', 
      !duplicateResponse.success && duplicateResponse.status === 409,
      `Expected 409 Conflict, got ${duplicateResponse.status}: ${duplicateResponse.data?.message || duplicateResponse.error}`);
    
    return todayStatus.checkIn;
  }
  
  // Test fresh check-in submission
  console.log('📋 Submitting new check-in...');
  
  const checkInData = {
    mood: 4,
    feedback: 'Test check-in from backend test script',
    source: 'web'
  };
  
  const response = await makeRequest('POST', '/checkins', checkInData, token);
  
  console.log('New check-in response:', {
    success: response.success,
    status: response.status,
    data: response.data
  });
  
  if (response.success && response.data.success) {
    const result = response.data.data;
    
    // Test response structure
    const hasRequiredFields = result.hasOwnProperty('checkIn') &&
                             result.hasOwnProperty('user') &&
                             result.hasOwnProperty('nextCheckIn');
    
    logTest('Submission Response Structure', hasRequiredFields,
      'Has required fields: checkIn, user, nextCheckIn');
    
    // Test check-in data
    const checkIn = result.checkIn;
    logTest('Check-in Data', 
      checkIn.mood === checkInData.mood && 
      checkIn.feedback === checkInData.feedback,
      `Mood: ${checkIn.mood}, Feedback: "${checkIn.feedback}"`);
    
    // Test happy coins
    logTest('Happy Coins Earned', 
      typeof checkIn.happyCoinsEarned === 'number' && checkIn.happyCoinsEarned > 0,
      `Earned: ${checkIn.happyCoinsEarned} happy coins`);
    
    // Test user data
    const user = result.user;
    logTest('User Data Update', 
      user.hasOwnProperty('totalHappyCoins') && 
      user.hasOwnProperty('currentStreak'),
      `Total coins: ${user.totalHappyCoins}, Streak: ${user.currentStreak}`);
    
    return checkIn;
  } else {
    logTest('Check-in Submission', false, 
      `API Error: ${JSON.stringify(response.error || response.data)}`);
    return null;
  }
}

async function testPostSubmissionStatus(token) {
  logSection('POST-SUBMISSION STATUS TEST');
  
  // Wait a moment for any background processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check status after submission
  console.log('📋 Checking post-submission status...');
  const response = await makeRequest('GET', '/checkins/today', null, token);
  
  if (response.success && response.data.success) {
    const data = response.data.data;
    
    console.log('Post-submission status:', {
      checkedInToday: data.checkedInToday,
      canCheckIn: data.canCheckIn,
      hasCheckInData: !!data.checkIn
    });
    
    logTest('Post-submission Status', 
      data.checkedInToday === true && data.canCheckIn === false,
      `checkedInToday: ${data.checkedInToday}, canCheckIn: ${data.canCheckIn}`);
    
    if (data.checkIn) {
      logTest('Check-in Data Persistence', 
        data.checkIn.hasOwnProperty('mood') && data.checkIn.hasOwnProperty('feedback'),
        `Mood: ${data.checkIn.mood}, Has feedback: ${!!data.checkIn.feedback}`);
    }
    
    return true;
  } else {
    logTest('Post-submission Status Check', false, 
      `API Error: ${JSON.stringify(response.error || response.data)}`);
    return false;
  }
}

function printSummary() {
  logSection('TEST SUMMARY');
  
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.passed + testResults.failed > 0) {
    console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  }
  
  if (testResults.failed > 0) {
    console.log('\n🚨 FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.message}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(testResults.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED');
  console.log('='.repeat(60));
}

async function runTests() {
  console.log('🧪 Backend Check-in API Test Suite');
  console.log(`🔗 Testing against: ${BASE_URL}`);
  console.log(`📅 Test started at: ${new Date().toISOString()}`);
  
  try {
    // Step 1: Authenticate
    const authResult = await authenticateUser();
    if (!authResult) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }
    
    const { token, user } = authResult;
    console.log(`👤 Using test user: ${user.email}`);
    
    // Step 2: Check current status
    const todayStatus = await testTodayCheckInStatus(token);
    
    // Step 3: Test check-in submission (or duplicate prevention)
    await testCheckInSubmission(token, todayStatus);
    
    // Step 4: Verify post-submission status
    await testPostSubmissionStatus(token);
    
    console.log('\n📋 Test completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error during testing:', error.message);
    logTest('Test Suite Execution', false, error.message);
  } finally {
    printSummary();
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };