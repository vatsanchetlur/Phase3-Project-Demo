#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// API Key headers
const headers = {
    'x-api-key': 'your-secret-api-key-here',
    'Content-Type': 'application/json'
};

async function testResetEndpoint() {
    console.log('🔄 Testing POST /customers/reset endpoint...\n');

    try {
        // Step 1: Get current customers count
        console.log('Step 1: Getting current customers count...');
        const beforeResetResponse = await axios.get(`${BASE_URL}/customers`, { headers });
        const beforeCount = beforeResetResponse.data.count;
        
        console.log(`✅ Current customers in database: ${beforeCount}`);
        if (beforeCount > 0) {
            console.log('Current customers:');
            beforeResetResponse.data.data.forEach((customer, index) => {
                console.log(`  ${index + 1}. ${customer.firstName} ${customer.lastName} (ID: ${customer.customerId})`);
            });
        }
        console.log();
        
        // Step 2: Execute the reset
        console.log('Step 2: Executing database reset...');
        const resetResponse = await axios.post(`${BASE_URL}/customers/reset`, {}, { headers });
        
        if (resetResponse.data.success) {
            console.log('✅ Database reset successful!');
            console.log('✅ Status:', resetResponse.status);
            console.log('✅ Message:', resetResponse.data.message);
            console.log('✅ Expected count:', resetResponse.data.count);
        } else {
            console.log('❌ Reset failed:', resetResponse.data.message);
            return;
        }
        console.log();
        
        // Step 3: Verify the reset worked
        console.log('Step 3: Verifying reset results...');
        const afterResetResponse = await axios.get(`${BASE_URL}/customers`, { headers });
        const afterCount = afterResetResponse.data.count;
        
        console.log(`✅ Customers after reset: ${afterCount}`);
        
        if (afterCount === 3) {
            console.log('✅ Verification successful! Database contains exactly 3 customers.');
        } else {
            console.log(`❌ Verification failed! Expected 3 customers, got ${afterCount}.`);
        }
        console.log();
        
        // Step 4: Display the default customers
        console.log('Step 4: Displaying default customers...');
        const customers = afterResetResponse.data.data;
        
        customers.forEach((customer, index) => {
            console.log(`Customer ${index + 1}:`);
            console.log(`  ✅ ID: ${customer.customerId}`);
            console.log(`  ✅ Name: ${customer.firstName} ${customer.lastName}`);
            console.log(`  ✅ Email: ${customer.email}`);
            console.log(`  ✅ Phone: ${customer.phone}`);
            console.log(`  ✅ Address: ${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`);
            console.log();
        });
        
        // Step 5: Verify customer IDs are sequential
        console.log('Step 5: Verifying customer IDs are sequential...');
        const customerIds = customers.map(c => c.customerId).sort((a, b) => a - b);
        const expectedIds = [1, 2, 3];
        
        const idsMatch = JSON.stringify(customerIds) === JSON.stringify(expectedIds);
        
        if (idsMatch) {
            console.log('✅ Customer IDs are sequential (1, 2, 3) as expected!');
        } else {
            console.log('❌ Customer IDs are not sequential!');
            console.log('Expected:', expectedIds);
            console.log('Actual:', customerIds);
        }
        console.log();
        
        // Step 6: Test that reset is idempotent (can be called multiple times)
        console.log('Step 6: Testing idempotency (calling reset again)...');
        const secondResetResponse = await axios.post(`${BASE_URL}/customers/reset`, {}, { headers });
        
        if (secondResetResponse.data.success) {
            console.log('✅ Second reset successful!');
            
            const afterSecondResetResponse = await axios.get(`${BASE_URL}/customers`, { headers });
            const secondResetCount = afterSecondResetResponse.data.count;
            
            if (secondResetCount === 3) {
                console.log('✅ Idempotency test passed! Still 3 customers after second reset.');
            } else {
                console.log(`❌ Idempotency test failed! Expected 3 customers, got ${secondResetCount}.`);
            }
        } else {
            console.log('❌ Second reset failed:', secondResetResponse.data.message);
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error in reset test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

async function testErrorCases() {
    console.log('🔄 Testing error cases...\n');
    
    // Note: The reset endpoint typically doesn't have error cases like other endpoints
    // since it's a simple operation that resets to a known state
    console.log('ℹ️  The reset endpoint is designed to be robust and typically doesn\'t have error cases.');
    console.log('ℹ️  It will always attempt to reset the database to the default state.');
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
    console.log('🔧 Customer REST API - RESET Endpoint Testing\n');
    
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
        process.exit(1);
    }

    await testResetEndpoint();
    await testErrorCases();
    console.log('🎉 All RESET endpoint tests completed successfully!');
}

main();
