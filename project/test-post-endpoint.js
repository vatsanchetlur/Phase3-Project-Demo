#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// API Key headers
const headers = {
    'x-api-key': 'your-secret-api-key-here',
    'Content-Type': 'application/json'
};

// Test data
const validCustomer = {
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    phone: "5551234567",
    address: {
        street: "789 Oak Street",
        city: "Seattle",
        state: "WA",
        zipCode: "98101"
    }
};

const invalidCustomer = {
    firstName: "A",
    lastName: "",
    email: "invalid-email",
    phone: "abc123",
    address: {
        street: "",
        city: "Seattle",
        state: "WA",
        zipCode: "98101"
    }
};

async function testPostEndpoint() {
    console.log('🚀 Testing POST /customers endpoint...\n');

    try {
        // Test 1: Valid customer creation
        console.log('📝 Test 1: Creating a valid customer...');
        const response1 = await axios.post(`${BASE_URL}/customers`, validCustomer, { headers });
        console.log('✅ Status:', response1.status);
        console.log('✅ Success:', response1.data.success);
        console.log('✅ Message:', response1.data.message);
        console.log('✅ Customer ID:', response1.data.data.customerId);
        console.log('✅ Email:', response1.data.data.email);
        console.log();

        // Test 2: Invalid customer validation
        console.log('📝 Test 2: Attempting to create invalid customer...');
        try {
            await axios.post(`${BASE_URL}/customers`, invalidCustomer, { headers });
        } catch (error) {
            console.log('✅ Status:', error.response.status);
            console.log('✅ Error:', error.response.data.error);
            console.log('✅ Validation errors:', error.response.data.errors.length);
            console.log('✅ First error:', error.response.data.errors[0]);
        }
        console.log();

        // Test 3: Duplicate email validation
        console.log('📝 Test 3: Attempting to create customer with duplicate email...');
        try {
            await axios.post(`${BASE_URL}/customers`, validCustomer, { headers });
        } catch (error) {
            console.log('✅ Status:', error.response.status);
            console.log('✅ Error:', error.response.data.error);
            console.log('✅ Message:', error.response.data.message);
        }
        console.log();

        // Test 4: Verify customer was added
        console.log('📝 Test 4: Verifying customer was added to database...');
        const response4 = await axios.get(`${BASE_URL}/customers`, { headers });
        console.log('✅ Total customers:', response4.data.count);
        console.log('✅ Latest customer email:', response4.data.data[0].email);
        console.log();

        console.log('🎉 All POST endpoint tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

async function checkServerStatus() {
    try {
        const response = await axios.get(`${BASE_URL}/customers`, { headers });
        console.log('🟢 Server is running and accessible\n');
        return true;
    } catch (error) {
        console.log('🔴 Server is not running or not accessible');
        console.log('Please make sure the server is running with: npm start\n');
        return false;
    }
}

async function main() {
    console.log('🔧 Customer REST API - POST Endpoint Testing\n');
    
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
        process.exit(1);
    }

    await testPostEndpoint();
}

main();
