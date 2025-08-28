// Test script to check risk assessment data
const axios = require('axios');

const BASE_URL = 'http://localhost:8005/api';

// You'll need to replace this with a valid HR/Admin token
const HR_TOKEN = 'your-hr-token-here';

async function testRiskAssessment() {
  try {
    console.log('Testing Risk Assessment API...');
    
    // Test 1: Get all employees
    console.log('\n1. Testing basic user query...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${HR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Users found:', usersResponse.data?.data?.users?.length || 0);
    
    if (usersResponse.data?.data?.users?.length > 0) {
      const firstUser = usersResponse.data.data.users[0];
      console.log('Sample user wellness data:', {
        riskLevel: firstUser.wellness?.riskLevel,
        riskScore: firstUser.wellness?.riskScore,
        happyCoins: firstUser.wellness?.happyCoins,
        currentStreak: firstUser.wellness?.currentStreak,
        lastCheckIn: firstUser.wellness?.lastCheckIn
      });
    }
    
    // Test 2: Get risk assessment
    console.log('\n2. Testing risk assessment API...');
    const riskResponse = await axios.get(`${BASE_URL}/analytics/risk-assessment`, {
      headers: {
        'Authorization': `Bearer ${HR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Risk assessment response:', riskResponse.data);
    
    // Test 3: Get recent check-ins
    console.log('\n3. Testing check-ins data...');
    const checkinsResponse = await axios.get(`${BASE_URL}/analytics/engagement?period=7`, {
      headers: {
        'Authorization': `Bearer ${HR_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Recent check-ins data:', checkinsResponse.data?.data?.dailyEngagement?.length || 0);
    
  } catch (error) {
    console.error('Error testing risk assessment:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
  }
}

// Instructions for use
console.log(`
🔍 Risk Assessment Test Script

To use this script:
1. Get an HR/Admin token by logging in as HR user
2. Replace 'your-hr-token-here' with the actual token
3. Run: node test-risk-assessment.js

This will help diagnose why risk assessment shows no data.
`);

// Uncomment the line below and add a valid token to run the test
// testRiskAssessment();

module.exports = { testRiskAssessment };