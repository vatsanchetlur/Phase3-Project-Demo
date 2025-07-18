const axios = require('axios');
const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Base URL for the API
const BASE_URL = 'http://localhost:4000';

// API Key headers
const headers = {
    'x-api-key': 'your-secret-api-key-here',
    'Content-Type': 'application/json'
};

/**
 * SIMPLE PUT TEST
 * This script does one thing only: execute a curl PUT request and verify it worked
 */
async function simplePutTest() {
    try {
        console.log('🔄 SIMPLE PUT TEST - Testing direct curl PUT request...\n');
        
        // Step 1: Get a valid customer ID
        console.log('Step 1: Getting a valid customer ID...');
        const getAllResponse = await axios.get(`${BASE_URL}/customers`, { headers });
        
        if (!getAllResponse.data.success || getAllResponse.data.data.length === 0) {
            console.log('❌ No customers found. Please reset the database first.');
            return;
        }
        
        const customer = getAllResponse.data.data[0];
        const customerId = customer.customerId;
        console.log(`Found customer with ID: ${customerId}`);
        
        // Step 2: Generate unique update data
        const timestamp = new Date().getTime();
        const uniqueName = `SimpleCurl-${timestamp.toString().slice(-6)}`;
        console.log(`Using unique name: ${uniqueName}`);
        
        const updateData = {
            firstName: uniqueName,
            lastName: 'SimpleCurlTest',
            email: customer.email,
            phone: '1234567890',
            address: {
                street: '123 Simple Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            }
        };
        
        // Step 3: Execute curl command
        console.log('\nStep 3: Executing curl command directly...');
        
        // Format JSON for curl
        const jsonData = JSON.stringify(updateData).replace(/"/g, '\\"');
        
        // Construct curl command
        const curlCommand = `curl -X PUT ${BASE_URL}/customers/${customerId} \
          -H "Content-Type: application/json" \
          -H "x-api-key: ${headers['x-api-key']}" \
          -d "${jsonData}" \
          --max-time 10`;
        
        console.log(`Executing curl command for customer ID: ${customerId}`);
        
        const { stdout, stderr } = await execPromise(curlCommand);
        
        if (stderr && !stderr.includes('Warning:')) {
            console.error(`Curl error: ${stderr}`);
        }
        
        console.log(`Curl response received: ${stdout.length} bytes`);
        const response = JSON.parse(stdout);
        
        if (response.success) {
            console.log('✅ Customer updated successfully via curl!');
            console.log('Updated customer data:');
            console.log(JSON.stringify(response.data, null, 2));
        } else {
            console.log('❌ Curl update failed:', response.error || 'Unknown error');
            return;
        }
        
        // Step 4: Verify update with GET request
        console.log('\nStep 4: Verifying update with GET request...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Short delay
        
        const verifyResponse = await axios.get(`${BASE_URL}/customers/${customerId}`, { headers });
        
        if (verifyResponse.data.success) {
            console.log('✅ GET verification successful!');
            console.log('Customer data from GET:');
            console.log(JSON.stringify(verifyResponse.data.data, null, 2));
            
            if (verifyResponse.data.data.firstName === uniqueName) {
                console.log('✅ VERIFIED: First name matches our update!');
            } else {
                console.log(`❌ VERIFICATION FAILED: First name is "${verifyResponse.data.data.firstName}", expected "${uniqueName}"`);
            }
        } else {
            console.log('❌ GET verification failed:', verifyResponse.data.error || 'Unknown error');
        }
        
        // Step 5: Direct MongoDB check
        console.log('\nStep 5: Checking MongoDB directly...');
        const client = new MongoClient('mongodb://localhost:27017');
        
        try {
            await client.connect();
            const db = client.db('custdb');
            const collection = db.collection('customers');
            const dbCustomer = await collection.findOne({ customerId: customerId });
            
            console.log('Customer data from MongoDB:');
            console.log(JSON.stringify(dbCustomer, null, 2));
            
            if (dbCustomer && dbCustomer.firstName === uniqueName) {
                console.log('✅ MONGODB VERIFIED: First name matches our update!');
                
                // Add a marker directly in MongoDB to prove we can modify it
                await collection.updateOne(
                    { customerId: customerId },
                    { $set: { verifiedInMongoDB: true } }
                );
                console.log('Added verification marker in MongoDB.');
            } else {
                console.log(`❌ MONGODB VERIFICATION FAILED: First name is "${dbCustomer?.firstName}", expected "${uniqueName}"`);
            }
        } catch (error) {
            console.error('MongoDB error:', error);
        } finally {
            await client.close();
        }
        
        console.log('\n✅ Simple PUT test completed!');
        
    } catch (error) {
        console.error('❌ Error in simple PUT test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Execute the test
simplePutTest();
