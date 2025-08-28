// Simple test script to verify analytics endpoints
import axios from 'axios';

const API_BASE = 'http://localhost:8005/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWExZDNjOGU4ZWI1ZGNjZDFkYTE5NSIsImVtYWlsIjoiY29kZWxpYnJhcnkyMUBnbWFpbC5jb20iLCJyb2xlIjoiaHIiLCJpYXQiOjE3MjI4NzI5ODYsImV4cCI6MTcyMjk1OTM4Nn0.cK5sB7qUvmE6XPyYqGI9yxfU_Y6m5qQIWZo1bLrjfcE';

async function testAnalytics() {
  try {
    console.log('Testing company overview...');
    const response = await axios.get(`${API_BASE}/analytics/company-overview`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('Success:', response.data);
    
    if (response.data.success && response.data.data.departmentBreakdown) {
      console.log('Available departments:', 
        response.data.data.departmentBreakdown.map(d => d.department)
      );
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAnalytics();