#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testSearchEndpoint() {
    console.log('🔍 Search Endpoint Testing Results\n');

    try {
        console.log('✅ Test Overview');
        console.log('Testing the GET /customers/find endpoint that finds customers based on query parameters.');
        console.log('No API key required. Supported fields: id, email, password. Single query parameter only.\n');

        // Test 1: Missing query parameter
        console.log('🧪 Test Scenario 1: Missing Query Parameter');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find"');
        try {
            await axios.get(`${BASE_URL}/customers/find`);
            console.log('❌ ERROR: Request should have failed without query parameter!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 2: Invalid field name
        console.log('🧪 Test Scenario 2: Invalid Field Name');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?invalidfield=test"');
        try {
            await axios.get(`${BASE_URL}/customers/find?invalidfield=test`);
            console.log('❌ ERROR: Request should have failed with invalid field!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 3: Search by ID (valid)
        console.log('🧪 Test Scenario 3: Search by ID (Valid)');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?id=2"');
        try {
            const response = await axios.get(`${BASE_URL}/customers/find?id=2`);
            console.log('✅ Status:', response.status);
            console.log('✅ Success:', response.data.success);
            console.log('✅ Count:', response.data.count);
            if (response.data.data && response.data.data.length > 0) {
                console.log('✅ Found Customer ID:', response.data.data[0].customerId);
                console.log('✅ Customer Name:', response.data.data[0].firstName, response.data.data[0].lastName);
            }
        } catch (error) {
            console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
        }
        console.log();

        // Test 4: Search by email (valid)
        console.log('🧪 Test Scenario 4: Search by Email (Valid)');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?email=jane.smith@example.com"');
        try {
            const response = await axios.get(`${BASE_URL}/customers/find?email=jane.smith@example.com`);
            console.log('✅ Status:', response.status);
            console.log('✅ Success:', response.data.success);
            console.log('✅ Count:', response.data.count);
            if (response.data.data && response.data.data.length > 0) {
                console.log('✅ Found Customer Email:', response.data.data[0].email);
                console.log('✅ Customer Name:', response.data.data[0].firstName, response.data.data[0].lastName);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 5: Search by password (should not match)
        console.log('🧪 Test Scenario 5: Search by Password');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?password=testpassword"');
        try {
            const response = await axios.get(`${BASE_URL}/customers/find?password=testpassword`);
            console.log('✅ Status:', response.status);
            console.log('✅ Success:', response.data.success);
            console.log('✅ Count:', response.data.count);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 6: Non-matching value
        console.log('🧪 Test Scenario 6: Non-Matching Value');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?id=999"');
        try {
            const response = await axios.get(`${BASE_URL}/customers/find?id=999`);
            console.log('✅ Status:', response.status);
            console.log('✅ Success:', response.data.success);
            console.log('✅ Count:', response.data.count);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 7: Multiple query parameters (should fail)
        console.log('🧪 Test Scenario 7: Multiple Query Parameters');
        console.log('cURL Command: curl -s "http://localhost:4000/customers/find?id=1&email=test@example.com"');
        try {
            await axios.get(`${BASE_URL}/customers/find?id=1&email=test@example.com`);
            console.log('❌ ERROR: Request should have failed with multiple parameters!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        console.log('⚙️ How to Test Manually');
        console.log('You can test these endpoints directly in your browser or with cURL commands:');
        console.log('• Copy any cURL command above and run it in your terminal');
        console.log('• Or visit the URLs directly in your browser (for GET requests)');
        console.log('• Note: Search endpoint does NOT require API key authentication\n');

        console.log('📝 Implementation Details');
        console.log('• Endpoint: GET /customers/find');
        console.log('• No API key required');
        console.log('• Single query parameter validation');
        console.log('• Supported fields: id, email, password');
        console.log('• "id" parameter maps to "customerId" in database');
        console.log('• Returns 400 for validation errors, 404 for no matches\n');

        console.log('🎉 Search endpoint tests completed!');

    } catch (error) {
        console.error('❌ Error running search endpoint tests:', error.message);
    }
}

async function checkServerStatus() {
    try {
        const response = await axios.get(`${BASE_URL}/customers/find?id=1`);
        console.log('🟢 Server is running and search endpoint is accessible\n');
        return true;
    } catch (error) {
        if (error.response) {
            console.log('🟢 Server is running and search endpoint is accessible\n');
            return true;
        } else {
            console.log('🔴 Server is not running or not accessible');
            console.log('Please make sure the server is running with: npm start\n');
            return false;
        }
    }
}

async function main() {
    console.log('🔧 Customer REST API - Search Endpoint Testing\n');
    
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
        process.exit(1);
    }

    await testSearchEndpoint();
}

main();
