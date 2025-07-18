const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const Customer = require('../models/Customer');

// Test database connection
beforeAll(async () => {
    const url = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/customer_test_db';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Clean up database after each test
afterEach(async () => {
    await Customer.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Customer API Endpoints', () => {
    describe('GET /customers', () => {
        it('should return empty array when no customers exist', async () => {
            const response = await request(app).get('/customers');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(0);
            expect(response.body.data).toEqual([]);
        });

        it('should return all customers when they exist', async () => {
            const customer = new Customer({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@test.com',
                phone: '1234567890',
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'TC',
                    zipCode: '12345'
                }
            });
            await customer.save();

            const response = await request(app).get('/customers');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.data[0].firstName).toBe('John');
        });
    });

    describe('GET /customers/:id', () => {
        it('should return customer by valid ID', async () => {
            const customer = new Customer({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@test.com',
                phone: '0987654321',
                address: {
                    street: '456 Test Ave',
                    city: 'Test City',
                    state: 'TC',
                    zipCode: '67890'
                }
            });
            const savedCustomer = await customer.save();

            const response = await request(app).get(`/customers/${savedCustomer._id}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Jane');
        });

        it('should return 404 for non-existent ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app).get(`/customers/${fakeId}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid ID format', async () => {
            const response = await request(app).get('/customers/invalid-id');
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /customers', () => {
        it('should create a new customer with valid data', async () => {
            const customerData = {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.johnson@test.com',
                phone: '5551234567',
                address: {
                    street: '789 New St',
                    city: 'New City',
                    state: 'NC',
                    zipCode: '54321'
                }
            };

            const response = await request(app)
                .post('/customers')
                .send(customerData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Alice');
            expect(response.body.data.email).toBe('alice.johnson@test.com');
        });

        it('should return 400 for invalid data', async () => {
            const invalidData = {
                firstName: 'John',
                // Missing required fields
            };

            const response = await request(app)
                .post('/customers')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for duplicate email', async () => {
            const customerData = {
                firstName: 'Bob',
                lastName: 'Wilson',
                email: 'duplicate@test.com',
                phone: '1111111111',
                address: {
                    street: '123 First St',
                    city: 'First City',
                    state: 'FC',
                    zipCode: '11111'
                }
            };

            // Create first customer
            await request(app).post('/customers').send(customerData);

            // Try to create duplicate
            const response = await request(app)
                .post('/customers')
                .send(customerData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /customers/:id', () => {
        it('should update existing customer', async () => {
            const customer = new Customer({
                firstName: 'Original',
                lastName: 'Name',
                email: 'original@test.com',
                phone: '1234567890',
                address: {
                    street: '123 Old St',
                    city: 'Old City',
                    state: 'OC',
                    zipCode: '00000'
                }
            });
            const savedCustomer = await customer.save();

            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put(`/customers/${savedCustomer._id}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Updated');
        });

        it('should return 404 for non-existent customer', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const updateData = { firstName: 'Updated' };

            const response = await request(app)
                .put(`/customers/${fakeId}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /customers/:id', () => {
        it('should delete existing customer', async () => {
            const customer = new Customer({
                firstName: 'ToDelete',
                lastName: 'Customer',
                email: 'delete@test.com',
                phone: '9999999999',
                address: {
                    street: '999 Delete St',
                    city: 'Delete City',
                    state: 'DC',
                    zipCode: '99999'
                }
            });
            const savedCustomer = await customer.save();

            const response = await request(app)
                .delete(`/customers/${savedCustomer._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Customer deleted successfully');
        });

        it('should return 404 for non-existent customer', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app).delete(`/customers/${fakeId}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
