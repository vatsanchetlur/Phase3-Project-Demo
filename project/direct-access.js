const { MongoClient, ObjectId } = require('mongodb');

// Global connection variables
let client = null;
let db = null;
let collection = null;
let counterCollection = null;

async function connect() {
    try {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        db = client.db('custdb');
        collection = db.collection('customers');
        counterCollection = db.collection('counters');
        
        // Initialize counter if it doesn't exist
        await initializeCounter();
        
        console.log('Connected to MongoDB database: custdb');
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
}

// Initialize counter for customer IDs
async function initializeCounter() {
    try {
        const counter = await counterCollection.findOne({ _id: 'customerid' });
        if (!counter) {
            await counterCollection.insertOne({ _id: 'customerid', seq: 0 });
        }
    } catch (error) {
        console.error('Error initializing counter:', error.message);
        throw error;
    }
}

// Get next customer ID
async function getNextCustomerId() {
    try {
        const result = await counterCollection.findOneAndUpdate(
            { _id: 'customerid' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after' }
        );
        return result.seq;
    } catch (error) {
        console.error('Error getting next customer ID:', error.message);
        throw error;
    }
}

async function disconnect() {
    if (client) {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

async function getCustomers() {
    try {
        const customers = await collection.find({}).sort({ createdAt: -1 }).toArray();
        // Remove MongoDB ObjectID and return customers with custom IDs
        return customers.map(customer => {
            const { _id, ...customerData } = customer;
            return customerData;
        });
    } catch (error) {
        console.error('Error fetching customers:', error.message);
        throw error;
    }
}

async function getCustomerById(id) {
    try {
        // Parse ID as integer for custom ID system
        const customerId = parseInt(id);
        if (isNaN(customerId) || customerId <= 0) {
            throw new Error('Invalid customer ID format');
        }
        
        const customer = await collection.findOne({ customerId: customerId });
        if (customer) {
            const { _id, ...customerData } = customer;
            return customerData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching customer by ID:', error.message);
        throw error;
    }
}

async function addCustomer(customerData) {
    try {
        // Get next customer ID
        const customerId = await getNextCustomerId();
        
        // Add custom ID and timestamps
        customerData.customerId = customerId;
        customerData.createdAt = new Date();
        customerData.updatedAt = new Date();
        
        // Check if email already exists
        const existingCustomer = await collection.findOne({ email: customerData.email });
        if (existingCustomer) {
            throw new Error('A customer with this email already exists');
        }

        const result = await collection.insertOne(customerData);
        const newCustomer = await collection.findOne({ _id: result.insertedId });
        
        // Return customer data without MongoDB ObjectID
        const { _id, ...customerDataResponse } = newCustomer;
        return customerDataResponse;
    } catch (error) {
        console.error('Error creating customer:', error.message);
        throw error;
    }
}

async function updateCustomer(id, updateData) {
    try {
        // Parse ID as integer for custom ID system
        const customerId = parseInt(id);
        if (isNaN(customerId) || customerId <= 0) {
            throw new Error('Invalid customer ID format');
        }

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Check if email already exists for another customer
        if (updateData.email) {
            const existingCustomer = await collection.findOne({ 
                email: updateData.email, 
                customerId: { $ne: customerId } 
            });
            if (existingCustomer) {
                throw new Error('A customer with this email already exists');
            }
        }

        const result = await collection.updateOne(
            { customerId: customerId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error('Customer not found');
        }

        const updatedCustomer = await collection.findOne({ customerId: customerId });
        
        // Return customer data without MongoDB ObjectID
        const { _id, ...customerDataResponse } = updatedCustomer;
        return customerDataResponse;
    } catch (error) {
        console.error('Error updating customer:', error.message);
        throw error;
    }
}

async function deleteCustomerById(id) {
    try {
        // Parse ID as integer for custom ID system
        const customerId = parseInt(id);
        if (isNaN(customerId) || customerId <= 0) {
            throw new Error('Invalid customer ID format');
        }

        const customer = await collection.findOne({ customerId: customerId });
        if (!customer) {
            throw new Error('Customer not found');
        }

        const result = await collection.deleteOne({ customerId: customerId });
        if (result.deletedCount === 0) {
            throw new Error('Customer not found');
        }

        // Return customer data without MongoDB ObjectID
        const { _id, ...customerDataResponse } = customer;
        return customerDataResponse;
    } catch (error) {
        console.error('Error deleting customer:', error.message);
        throw error;
    }
}

async function resetCustomers() {
    try {
        // creates a variable pointing to an array containing three customer objects
        const customerArray = [
            {
                customerId: 1,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "1234567890",
                address: {
                    street: "123 Main St",
                    city: "New York",
                    state: "NY",
                    zipCode: "10001"
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                customerId: 2,
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com",
                phone: "9876543210",
                address: {
                    street: "456 Oak Ave",
                    city: "Los Angeles",
                    state: "CA",
                    zipCode: "90210"
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                customerId: 3,
                firstName: "Michael",
                lastName: "Johnson",
                email: "michael.johnson@example.com",
                phone: "5551234567",
                address: {
                    street: "789 Pine Rd",
                    city: "Chicago",
                    state: "IL",
                    zipCode: "60601"
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        // deletes all existing records in the customer collection using the collection's deleteMany({}) method
        await collection.deleteMany({});
        
        // Reset the counter to 3 (since we're adding 3 customers)
        await counterCollection.updateOne(
            { _id: 'customerid' },
            { $set: { seq: 3 } },
            { upsert: true }
        );
        
        // adds records from the customer array to the customer collection using the collection's insertMany() method
        const result = await collection.insertMany(customerArray);
        
        // gets a count of records in the collection
        const count = await collection.countDocuments();
        
        // on success it returns a message saying how many records are now in the collection
        return `${count} records are now in the collection`;
    } catch (error) {
        // if an error is thrown it returns the error object's message
        return error.message;
    }
}

async function seedDatabase(sampleData) {
    try {
        // Clear existing data
        await collection.deleteMany({});
        
        // Reset counter
        await counterCollection.updateOne(
            { _id: 'customerid' },
            { $set: { seq: 0 } },
            { upsert: true }
        );
        
        // Add timestamps and custom IDs to sample data
        const dataWithTimestamps = sampleData.map((customer, index) => ({
            ...customer,
            customerId: index + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        
        // Update counter to reflect the number of customers added
        await counterCollection.updateOne(
            { _id: 'customerid' },
            { $set: { seq: sampleData.length } },
            { upsert: true }
        );

        const result = await collection.insertMany(dataWithTimestamps);
        return result.insertedCount;
    } catch (error) {
        console.error('Error seeding database:', error.message);
        throw error;
    }
}

async function findCustomersByCity(city) {
    try {
        const customers = await collection.find({ 'address.city': city }).toArray();
        // Remove MongoDB ObjectID and return customers with custom IDs
        return customers.map(customer => {
            const { _id, ...customerData } = customer;
            return customerData;
        });
    } catch (error) {
        console.error('Error finding customers by city:', error.message);
        throw error;
    }
}

async function searchCustomers(filter) {
    try {
        if (!collection) {
            throw new Error('Database not connected. Call connect() first.');
        }

        // Find customers matching the filter
        const customers = await collection.find(filter).toArray();
        
        // Remove MongoDB _id field from results and return clean customer objects
        return customers.map(customer => {
            const { _id, ...cleanCustomer } = customer;
            return cleanCustomer;
        });
    } catch (error) {
        console.error('Error searching customers:', error.message);
        throw error;
    }
}

module.exports = { 
    getCustomers, 
    getCustomerById, 
    addCustomer, 
    updateCustomer, 
    deleteCustomerById, 
    resetCustomers, 
    seedDatabase, 
    findCustomersByCity,
    searchCustomers,
    connect, 
    disconnect 
};
