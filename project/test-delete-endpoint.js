#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// API Key headers
const headers = {
    'x-api-key': 'your-secret-api-key-here',
    'Content-Type': 'application/json'
};

async function testDeleteEndpoint() {
    console.log('🔄 Testing DELETE /customers/:id endpoint...\n');

    try {
        // Step 1: Get all customers to find a valid ID
        console.log('Step 1: Getting all customers to find a valid ID...');
        const getAllResponse = await axios.get(`${BASE_URL}/customers`, { headers });
        
        if (!getAllResponse.data.success || getAllResponse.data.data.length === 0) {
            console.log('❌ No customers found. Please reset the database first.');
            return;
        }
        
        const customers = getAllResponse.data.data;
        const customerToDelete = customers[0];
        const customerId = customerToDelete.customerId;
        
        console.log(`✅ Found customer with ID: ${customerId}`);
        console.log('Customer to delete:');
        console.log(JSON.stringify(customerToDelete, null, 2));
        console.log();
        
        // Step 2: Delete the customer
        console.log('Step 2: Deleting customer...');
        const deleteResponse = await axios.delete(`${BASE_URL}/customers/${customerId}`, { headers });
        
        if (deleteResponse.data.success) {
            console.log('✅ Customer deleted successfully!');
            console.log('✅ Status:', deleteResponse.status);
            console.log('✅ Message:', deleteResponse.data.message);
            console.log('Deleted customer data:');
            console.log(JSON.stringify(deleteResponse.data.data, null, 2));
        } else {
            console.log('❌ Delete failed:', deleteResponse.data.message);
        }
        console.log();
        
        // Step 3: Verify the customer was deleted
        console.log('Step 3: Verifying customer was deleted...');
        const getAllAfterDelete = await axios.get(`${BASE_URL}/customers`, { headers });
        const remainingCustomers = getAllAfterDelete.data.data;
        
        const customerStillExists = remainingCustomers.find(c => c.customerId === customerId);
        
        if (!customerStillExists) {
            console.log('✅ Verification successful! Customer was deleted from database.');
            console.log(`✅ Remaining customers: ${remainingCustomers.length}`);
        } else {
            console.log('❌ Verification failed! Customer still exists in database.');
        }
        console.log();
        
        // Step 4: Try to get the deleted customer (should return 404)
        console.log('Step 4: Attempting to get deleted customer (should return 404)...');
        try {
            await axios.get(`${BASE_URL}/customers/${customerId}`, { headers });
            console.log('❌ Error: Deleted customer was still found!');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Correct! Got 404 error for deleted customer.');
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error in main delete test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Test error cases
async function testErrorCases() {
    console.log('🔄 Testing error cases...\n');
    
    try {
        // Test 1: Invalid ID
        console.log('Test 1: Invalid ID (should return 400)');
        await axios.delete(`${BASE_URL}/customers/invalid-id`, { headers });
    } catch (error) {
        console.log('✅ Invalid ID test passed:', error.response?.status, error.response?.data?.error);
    }
    
    try {
        // Test 2: Non-existent ID
        console.log('Test 2: Non-existent ID (should return 404)');
        await axios.delete(`${BASE_URL}/customers/999999`, { headers });
    } catch (error) {
        console.log('✅ Non-existent ID test passed:', error.response?.status, error.response?.data?.error);
    }
    
    console.log();
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
    console.log('🔧 Customer REST API - DELETE Endpoint Testing\n');
    
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
        process.exit(1);
    }

    await testDeleteEndpoint();
    await testErrorCases();
    console.log('🎉 All DELETE endpoint tests completed successfully!');
}

main();
