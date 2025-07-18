const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// GET /customers - Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
});

// GET /customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found',
                message: `Customer with ID ${req.params.id} does not exist`
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        // Check if error is due to invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Customer ID',
                message: 'Please provide a valid customer ID'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
});

// POST /customers - Create a new customer
router.post('/', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        const savedCustomer = await customer.save();
        
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: savedCustomer
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Please check the provided data',
                errors: errors
            });
        }
        
        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate Entry',
                message: 'A customer with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
});

// PUT /customers/:id - Update customer by ID
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found',
                message: `Customer with ID ${req.params.id} does not exist`
            });
        }

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    } catch (error) {
        // Check if error is due to invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Customer ID',
                message: 'Please provide a valid customer ID'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Please check the provided data',
                errors: errors
            });
        }
        
        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate Entry',
                message: 'A customer with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
});

// DELETE /customers/:id - Delete customer by ID
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found',
                message: `Customer with ID ${req.params.id} does not exist`
            });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully',
            data: customer
        });
    } catch (error) {
        // Check if error is due to invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid Customer ID',
                message: 'Please provide a valid customer ID'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
});

module.exports = router;
