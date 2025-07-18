#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testApiKeyMiddleware() {
    console.log('🔐 Testing API Key Middleware...\n');

    try {
        // Test 1: Try to access endpoint without API key
        console.log('Test 1: Access endpoint WITHOUT API key (should return 401)');
        try {
            await axios.get(`${BASE_URL}/customers`);
            console.log('❌ ERROR: Request succeeded without API key!');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 2: Try to access endpoint with invalid API key
        console.log('Test 2: Access endpoint with INVALID API key (should return 403)');
        try {
            await axios.get(`${BASE_URL}/customers`, {
                headers: { 'x-api-key': 'invalid-key' }
            });
            console.log('❌ ERROR: Request succeeded with invalid API key!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Status:', error.response.status);
                console.log('✅ Error:', error.response.data.error);
                console.log('✅ Message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
            }
        }
        console.log();

        // Test 3: Try to access endpoint with valid API key
        console.log('Test 3: Access endpoint with VALID API key (should return 200)');
        try {
            const response = await axios.get(`${BASE_URL}/customers`, {
                headers: { 'x-api-key': 'your-secret-api-key-here' }
            });
            console.log('✅ Status:', response.status);
            console.log('✅ Success:', response.data.success);
            console.log('✅ Count:', response.data.count);
        } catch (error) {
            console.log('❌ ERROR: Request failed with valid API key!');
            console.log('❌ Status:', error.response?.status);
            console.log('❌ Error:', error.response?.data);
        }
        console.log();

        console.log('🎉 API Key middleware tests completed!');

    } catch (error) {
        console.error('❌ Error running tests:', error.message);
    }
}

testApiKeyMiddleware();
