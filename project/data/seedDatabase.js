require('dotenv').config();

const DataAccess = require('../data-access');
const sampleCustomers = require('./sampleCustomers');

const dataAccess = new DataAccess();

async function seedDatabase() {
    try {
        // Initialize database connection
        await dataAccess.initialize();
        console.log('Connected to MongoDB database');

        // Seed the database
        const [message, error] = await dataAccess.resetCustomers();
        
        if (error) {
            console.error('Error seeding database:', error.message);
        } else {
            console.log('Cleared existing customer data');
            console.log(message);

            // Display inserted customers
            const [customers, getError] = await dataAccess.getCustomers();
            if (getError) {
                console.error('Error fetching customers:', getError.message);
            } else {
                console.log('\nInserted customers:');
                customers.forEach((customer, index) => {
                    console.log(`${index + 1}. ${customer.firstName} ${customer.lastName} - ${customer.email}`);
                });
            }
        }

        await dataAccess.shutdown();
        console.log('\nDatabase seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error.message);
        await dataAccess.shutdown();
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    await dataAccess.shutdown();
    console.log('\nDatabase connection closed.');
    process.exit(0);
});

seedDatabase();
