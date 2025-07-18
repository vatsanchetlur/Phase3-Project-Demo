const mongoose = require('mongoose');

// Define the address schema
const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    }
});

// Define the customer schema
const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    address: {
        type: addressSchema,
        required: [true, 'Address is required']
    }
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Create indexes for better performance
customerSchema.index({ email: 1 });
customerSchema.index({ lastName: 1, firstName: 1 });

// Instance method to get full name
customerSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Static method to find customers by city
customerSchema.statics.findByCity = function(city) {
    return this.find({ 'address.city': city });
};

// Pre-save middleware to format names
customerSchema.pre('save', function(next) {
    if (this.firstName) {
        this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
    }
    if (this.lastName) {
        this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
    }
    next();
});

// Create and export the model
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
