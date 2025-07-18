const axios = require('axios');

// Example of correct PUT request usage
async function updateCustomerExample() {
    try {
        // Get a valid customer ID first
        const getAllResponse = await axios.get('http://localhost:4000/customers');
        const customers = getAllResponse.data.data;
        
        if (customers.length === 0) {
            console.log('❌ No customers found');
            return;
        }
        
        const customerId = customers[0].customerId;
        console.log(`✅ Using customer ID: ${customerId}`);
        
        // ✅ CORRECT: Use the actual ID number
        const updateData = {
            firstName: 'Correctly Updated',
            lastName: 'Test User',
            email: customers[0].email, // Keep same email to avoid conflicts
            phone: '5555555555',
            address: {
                street: '456 Correct Street',
                city: 'Test City',
                state: 'TC',
                zipCode: '54321'
            }
        };
        
        const response = await axios.put(`http://localhost:4000/customers/${customerId}`, updateData);
        
        console.log('✅ Success!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Examples of common mistakes and correct usage
function demonstrateCorrectUsage() {
    console.log('📋 Correct URL patterns:');
    console.log('✅ PUT /customers/1');
    console.log('✅ PUT /customers/2');
    console.log('✅ PUT /customers/3');
    console.log('');
    console.log('❌ WRONG URL patterns:');
    console.log('❌ PUT /customers/:1');
    console.log('❌ PUT /customers/:2');
    console.log('❌ PUT /customers/:3');
    console.log('');
    console.log('Note: The colon (:) is only used in route definitions, not in actual API calls!');
}

demonstrateCorrectUsage();
updateCustomerExample();
