require('dotenv').config();
const DirectAccess = require('./direct-access');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        await DirectAccess.connect();
        console.log('✅ Connection successful!');
        
        // Reset database first
        console.log('Resetting database...');
        const resetResult = await DirectAccess.resetCustomers();
        console.log('✅ Database reset:', resetResult);
        
        // Test getting all customers after reset
        console.log('Testing get all customers after reset...');
        const customersAfterReset = await DirectAccess.getCustomers();
        console.log('✅ Retrieved customers after reset:', customersAfterReset);
        
        // Test creating a customer
        console.log('Testing customer creation...');
        const newCustomer = await DirectAccess.addCustomer({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '1234567890',
            address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TC',
                zipCode: '12345'
            }
        });
        
        console.log('✅ Customer created:', newCustomer);
        
        // Test getting all customers
        console.log('Testing get all customers...');
        const customers = await DirectAccess.getCustomers();
        console.log('✅ Retrieved customers:', customers);
        
        // Test getting customer by ID
        console.log('Testing get customer by ID...');
        const customer = await DirectAccess.getCustomerById(newCustomer.customerId);
        console.log('✅ Retrieved customer by ID:', customer);
        
        // Test updating a customer
        console.log('Testing customer update...');
        const updatedCustomer = await DirectAccess.updateCustomer(newCustomer.customerId, {
            firstName: 'Updated Test',
            lastName: 'Updated User'
        });
        console.log('✅ Updated customer:', updatedCustomer);
        
        // Test deleting a customer
        console.log('Testing customer deletion...');
        const deletedCustomer = await DirectAccess.deleteCustomerById(newCustomer.customerId);
        console.log('✅ Deleted customer:', deletedCustomer);
        
        await DirectAccess.disconnect();
        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error);
    }
}

testConnection();
