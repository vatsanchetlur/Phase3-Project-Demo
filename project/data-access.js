const directAccess = require('./direct-access');

class DataAccess {
    constructor() {
        // No need to instantiate DirectAccess since it's now function-based
    }

    async initialize() {
        await directAccess.connect();
    }

    async shutdown() {
        await directAccess.disconnect();
    }

    // Customer validation helper
    validateCustomer(customerData) {
        const errors = [];

        // Required fields validation
        if (!customerData.firstName || customerData.firstName.trim().length < 2) {
            errors.push('First name is required and must be at least 2 characters long');
        }
        if (!customerData.lastName || customerData.lastName.trim().length < 2) {
            errors.push('Last name is required and must be at least 2 characters long');
        }
        if (!customerData.email || !this.isValidEmail(customerData.email)) {
            errors.push('Valid email is required');
        }
        if (!customerData.phone || !this.isValidPhone(customerData.phone)) {
            errors.push('Valid phone number is required');
        }
        if (!customerData.address || !this.isValidAddress(customerData.address)) {
            errors.push('Complete address is required');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone);
    }

    isValidAddress(address) {
        return address && 
               address.street && address.street.trim().length > 0 &&
               address.city && address.city.trim().length > 0 &&
               address.state && address.state.trim().length > 0 &&
               address.zipCode && address.zipCode.trim().length > 0;
    }

    // Format customer data
    formatCustomerData(customerData) {
        return {
            firstName: customerData.firstName ? customerData.firstName.trim() : '',
            lastName: customerData.lastName ? customerData.lastName.trim() : '',
            email: customerData.email ? customerData.email.trim().toLowerCase() : '',
            phone: customerData.phone ? customerData.phone.trim() : '',
            address: {
                street: customerData.address?.street ? customerData.address.street.trim() : '',
                city: customerData.address?.city ? customerData.address.city.trim() : '',
                state: customerData.address?.state ? customerData.address.state.trim() : '',
                zipCode: customerData.address?.zipCode ? customerData.address.zipCode.trim() : ''
            }
        };
    }

    async getCustomers() {
        try {
            const customers = await directAccess.getCustomers();
            return [customers, null];
        } catch (error) {
            return [null, {
                error: 'Server Error',
                message: error.message
            }];
        }
    }

    async getCustomerById(id) {
        try {
            const customer = await directAccess.getCustomerById(id);
            if (!customer) {
                return [null, {
                    error: 'Customer not found',
                    message: `Customer with ID ${id} does not exist`
                }];
            }
            return [customer, null];
        } catch (error) {
            return [null, {
                error: error.message.includes('Invalid') ? 'Invalid Customer ID' : 'Server Error',
                message: error.message
            }];
        }
    }

    async addCustomer(customerData) {
        try {
            // Format and validate data
            const formattedData = this.formatCustomerData(customerData);
            const validationErrors = this.validateCustomer(formattedData);

            if (validationErrors.length > 0) {
                return [null, {
                    error: 'Validation Error',
                    message: 'Please check the provided data',
                    errors: validationErrors
                }];
            }

            const newCustomer = await directAccess.addCustomer(formattedData);
            return [newCustomer, null];
        } catch (error) {
            return [null, {
                error: error.message.includes('email already exists') ? 'Duplicate Entry' : 'Server Error',
                message: error.message
            }];
        }
    }

    async updateCustomer(id, updateData) {
        try {
            // Format data (only update provided fields)
            const formattedData = {};
            if (updateData.firstName) formattedData.firstName = updateData.firstName.trim();
            if (updateData.lastName) formattedData.lastName = updateData.lastName.trim();
            if (updateData.email) formattedData.email = updateData.email.trim().toLowerCase();
            if (updateData.phone) formattedData.phone = updateData.phone.trim();
            if (updateData.address) {
                formattedData.address = {
                    street: updateData.address.street ? updateData.address.street.trim() : '',
                    city: updateData.address.city ? updateData.address.city.trim() : '',
                    state: updateData.address.state ? updateData.address.state.trim() : '',
                    zipCode: updateData.address.zipCode ? updateData.address.zipCode.trim() : ''
                };
            }

            const updatedCustomer = await directAccess.updateCustomer(id, formattedData);
            return [updatedCustomer, null];
        } catch (error) {
            return [null, {
                error: error.message.includes('not found') ? 'Customer not found' : 
                       error.message.includes('Invalid') ? 'Invalid Customer ID' :
                       error.message.includes('email already exists') ? 'Duplicate Entry' : 'Server Error',
                message: error.message
            }];
        }
    }

    async deleteCustomerById(id) {
        try {
            const deletedCustomer = await directAccess.deleteCustomerById(id);
            return [deletedCustomer, null];
        } catch (error) {
            return [null, {
                error: error.message.includes('not found') ? 'Customer not found' : 
                       error.message.includes('Invalid') ? 'Invalid Customer ID' : 'Server Error',
                message: error.message
            }];
        }
    }

    async seedDatabase(sampleData) {
        try {
            const count = await directAccess.seedDatabase(sampleData);
            return {
                success: true,
                message: `Successfully inserted ${count} sample customers`,
                count: count
            };
        } catch (error) {
            return {
                success: false,
                error: 'Seeding Error',
                message: error.message
            };
        }
    }

    async findCustomersByCity(city) {
        try {
            const customers = await directAccess.findCustomersByCity(city);
            return {
                success: true,
                count: customers.length,
                data: customers
            };
        } catch (error) {
            return {
                success: false,
                error: 'Server Error',
                message: error.message
            };
        }
    }

    async searchCustomers(field, value) {
        try {
            // Create search filter based on field and value
            const filter = {};
            
            // Map "id" to our actual "customerId" field
            if (field === 'id') {
                const numericValue = parseInt(value);
                if (isNaN(numericValue)) {
                    return [[], null]; // Return empty array for invalid ID
                }
                filter['customerId'] = numericValue;
            } else if (field === 'email') {
                // For email, do exact match (case-sensitive)
                filter[field] = value;
            } else if (field === 'password') {
                // Our customers don't have passwords, so always return empty
                return [[], null];
            } else {
                // For any other fields, do exact match
                filter[field] = value;
            }

            const customers = await directAccess.searchCustomers(filter);
            return [customers, null];
        } catch (error) {
            return [null, {
                error: 'Search Error',
                message: error.message
            }];
        }
    }

    async resetCustomers() {
        try {
            const result = await directAccess.resetCustomers();
            return [result, null];
        } catch (error) {
            return [null, {
                error: 'Reset Error',
                message: error.message
            }];
        }
    }
}

module.exports = DataAccess;
