const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const DataAccess = require('./data-access');
const requireApiKey = require('./middleware/apiKeyMiddleware');

// Function to get and validate API key from environment or command line
function getApiKey() {
    // Check for command line argument first (format: --api-key=value)
    const cmdLineApiKey = process.argv.find(arg => arg.startsWith('--api-key='));
    if (cmdLineApiKey) {
        return cmdLineApiKey.split('=')[1];
    }
    
    // Fall back to environment variable
    return process.env.API_KEY;
}

// Function to validate API key and exit if not found
function validateApiKey() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.log("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
        process.exit(1);
    }
    // Set the API key in process.env for middleware to use
    process.env.API_KEY = apiKey;
    console.log('API Key loaded successfully');
    return apiKey;
}

// Validate API key on startup
validateApiKey();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize data access layer
const dataAccess = new DataAccess();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
// GET /customers - Get all customers
app.get('/customers', requireApiKey, async (req, res) => {
    const [customers, error] = await dataAccess.getCustomers();
    if (error) {
        res.status(500).json({
            success: false,
            error: error.error,
            message: error.message
        });
    } else {
        res.json({
            success: true,
            count: customers.length,
            data: customers
        });
    }
});

// GET /customers/find - Search customers by query parameters (no API key required)
app.get('/customers/find', async (req, res) => {
    try {
        // Check if query string is provided
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query string is required',
                message: 'query string is required'
            });
        }

        // Check for single name/value pair only
        if (queryKeys.length > 1) {
            return res.status(400).json({
                success: false,
                error: 'Single query parameter only',
                message: 'Only a single name/value pair is supported in the query string'
            });
        }

        const queryKey = queryKeys[0];
        const queryValue = req.query[queryKey];

        // Validate that the query key matches allowed customer properties
        const allowedProperties = ['id', 'email', 'password'];
        if (!allowedProperties.includes(queryKey)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameter',
                message: `name must be one of the following (${allowedProperties.join(', ')})`
            });
        }

        // Search for customers matching the query
        const [customers, error] = await dataAccess.searchCustomers(queryKey, queryValue);
        
        if (error) {
            return res.status(500).json({
                success: false,
                error: error.error,
                message: error.message
            });
        }

        // Check if any customers were found
        if (!customers || customers.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No matches found',
                message: 'no matching customer documents found'
            });
        }

        // Return matching customers
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
app.get('/customers/:id', requireApiKey, async (req, res) => {
    const [customer, error] = await dataAccess.getCustomerById(req.params.id);
    if (error) {
        const statusCode = error.error === 'Customer not found' ? 404 : 
                          error.error === 'Invalid Customer ID' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.error,
            message: error.message
        });
    } else {
        res.json({
            success: true,
            data: customer
        });
    }
});

// POST /customers - Create a new customer
app.post('/customers', requireApiKey, async (req, res) => {
    const [customer, error] = await dataAccess.addCustomer(req.body);
    if (error) {
        const statusCode = error.error === 'Validation Error' ? 400 : 
                          error.error === 'Duplicate Entry' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.error,
            message: error.message,
            errors: error.errors
        });
    } else {
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });
    }
});

// PUT /customers/:id - Update customer by ID
app.put('/customers/:id', requireApiKey, async (req, res) => {
    const [customer, error] = await dataAccess.updateCustomer(req.params.id, req.body);
    if (error) {
        const statusCode = error.error === 'Customer not found' ? 404 : 
                          error.error === 'Invalid Customer ID' ? 400 :
                          error.error === 'Duplicate Entry' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.error,
            message: error.message
        });
    } else {
        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    }
});

// DELETE /customers/:id - Delete customer by ID
app.delete('/customers/:id', requireApiKey, async (req, res) => {
    const [customer, error] = await dataAccess.deleteCustomerById(req.params.id);
    if (error) {
        const statusCode = error.error === 'Customer not found' ? 404 : 
                          error.error === 'Invalid Customer ID' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.error,
            message: error.message
        });
    } else {
        res.json({
            success: true,
            message: 'Customer deleted successfully',
            data: customer
        });
    }
});

// GET /reset - Reset customer collection to example data
app.get('/reset', requireApiKey, async (req, res) => {
    // Calls the data access layer's "resetCustomers" method
    const [result, err] = await dataAccess.resetCustomers();
    
    // If result is not null return result
    if (result !== null) {
        res.json(result);
    } else {
        // If result is null then set the return status to 500 and return err
        res.status(500).json(err);
    }
});

// POST /customers/reset - Reset customer collection to example data
app.post('/customers/reset', requireApiKey, async (req, res) => {
    const [message, error] = await dataAccess.resetCustomers();
    if (error) {
        res.status(500).json({
            success: false,
            error: error.error,
            message: error.message
        });
    } else {
        res.json({
            success: true,
            message: message,
            count: 3
        });
    }
});

// GET /test-connection - Execute test-post-endpoint.js and return results
app.get('/test-connection', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-post-endpoint.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            const success = code === 0;
            sendResponse({
                success: success,
                exitCode: code,
                output: output,
                error: errorOutput,
                timestamp: new Date().toISOString()
            });
        });
        
        child.on('error', (error) => {
            sendResponse({
                success: false,
                error: 'Failed to start test process',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            if (!child.killed && !responseSent) {
                child.kill('SIGTERM');
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // 30 second timeout
        
        // Clear timeout when process finishes
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-put - Execute test-put-endpoint.js and return results
app.get('/test-put', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    // Add direct MongoDB test
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('SERVER: Connected to MongoDB directly');
        const db = client.db('custdb');
        const collection = db.collection('customers');
        const before = await collection.findOne({ customerId: 4 });
        console.log('SERVER: Before test - Customer 4:', JSON.stringify(before, null, 2));
    } catch (err) {
        console.error('SERVER: MongoDB error:', err);
    } finally {
        await client.close();
    }
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-put-endpoint.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            const success = code === 0;
            sendResponse({
                success: success,
                exitCode: code,
                output: output,
                error: errorOutput,
                timestamp: new Date().toISOString()
            });
        });
        
        child.on('error', (error) => {
            sendResponse({
                success: false,
                error: 'Failed to start test process',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            if (!child.killed && !responseSent) {
                child.kill('SIGTERM');
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // 30 second timeout
        
        // Clear timeout when process finishes
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-put-simple - Execute test-put-simple.js and return results
app.get('/test-put-simple', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    const { MongoClient } = require('mongodb');
    
    let responseSent = false;
    
    // Log initial state for debugging
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        console.log('SERVER: Connected to MongoDB directly in /test-put-simple');
        const db = client.db('custdb');
        const collection = db.collection('customers');
        const before = await collection.findOne({ customerId: 4 });
        console.log('SERVER: Before simple test - Customer 4:', JSON.stringify(before, null, 2));
    } catch (err) {
        console.error('SERVER: MongoDB error:', err);
    } finally {
        await client.close();
    }
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            
            // Add a final MongoDB check before sending response
            setTimeout(async () => {
                const finalClient = new MongoClient(process.env.MONGODB_URI);
                try {
                    await finalClient.connect();
                    console.log('SERVER: Final MongoDB check in /test-put-simple');
                    const db = finalClient.db('custdb');
                    const collection = db.collection('customers');
                    const after = await collection.findOne({ customerId: 4 });
                    console.log('SERVER: After test completed - Customer 4:', JSON.stringify(after, null, 2));
                } catch (err) {
                    console.error('SERVER: Final MongoDB check error:', err);
                } finally {
                    await finalClient.close();
                }
            }, 500);
            
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-put-simple.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            const chunk = data.toString();
            output += chunk;
            console.log(`SIMPLE-TEST OUTPUT: ${chunk}`);
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`SIMPLE-TEST ERROR: ${data.toString()}`);
        });
        
        child.on('close', (code) => {
            const success = code === 0;
            sendResponse({
                success: success,
                exitCode: code,
                output: output,
                error: errorOutput,
                timestamp: new Date().toISOString()
            });
            
            // Log MongoDB state after child process ends
            setTimeout(async () => {
                const afterClient = new MongoClient(process.env.MONGODB_URI);
                try {
                    await afterClient.connect();
                    console.log('SERVER: MongoDB check after child process');
                    const db = afterClient.db('custdb');
                    const collection = db.collection('customers');
                    const after = await collection.findOne({ customerId: 4 });
                    console.log('SERVER: After child process - Customer 4:', JSON.stringify(after, null, 2));
                } catch (err) {
                    console.error('SERVER: MongoDB check error:', err);
                } finally {
                    await afterClient.close();
                }
            }, 200);
        });
        
        child.on('error', (error) => {
            sendResponse({
                success: false,
                error: 'Failed to start test process',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            if (!child.killed && !responseSent) {
                child.kill('SIGTERM');
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // 30 second timeout
        
        // Clear timeout when process finishes
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-reset - Execute test-reset-endpoint.js and return results
app.get('/test-reset', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-reset-endpoint.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            sendResponse({
                success: code === 0,
                exitCode: code,
                output: output,
                error: errorOutput || null,
                timestamp: new Date().toISOString()
            });
        });
        
        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            if (!responseSent) {
                child.kill();
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
        
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-api-key - Execute test-api-key.js and return results
app.get('/test-api-key', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-api-key.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            const success = code === 0;
            sendResponse({
                success: success,
                exitCode: code,
                output: output,
                error: errorOutput,
                timestamp: new Date().toISOString()
            });
        });
        
        child.on('error', (error) => {
            sendResponse({
                success: false,
                error: 'Failed to start test process',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
        
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            if (!child.killed && !responseSent) {
                child.kill('SIGTERM');
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000); // 30 second timeout
        
        // Clear timeout when process finishes
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-api-parameter - Execute API parameter tests and return results
app.get('/test-api-parameter', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-api-parameter.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            sendResponse({
                success: code === 0,
                exitCode: code,
                output: output,
                error: errorOutput || null,
                timestamp: new Date().toISOString()
            });
        });
        
        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            if (!responseSent) {
                child.kill();
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
        
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-search-endpoint - Execute search endpoint tests and return results
app.get('/test-search-endpoint', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-search-endpoint.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            sendResponse({
                success: code === 0,
                exitCode: code,
                output: output,
                error: errorOutput || null,
                timestamp: new Date().toISOString()
            });
        });
        
        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            if (!responseSent) {
                child.kill();
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
        
        child.on('close', () => {
            clearTimeout(timeout);
        });
        
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Failed to execute test script',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /test-delete - Execute delete endpoint tests and return results
app.get('/test-delete', async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    
    let responseSent = false;
    
    const sendResponse = (responseData) => {
        if (!responseSent) {
            responseSent = true;
            res.json(responseData);
        }
    };
    
    try {
        const testScript = path.join(__dirname, 'test-delete-endpoint.js');
        const child = spawn('node', [testScript]);
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            sendResponse({
                success: code === 0,
                exitCode: code,
                output: output,
                error: errorOutput || null,
                timestamp: new Date().toISOString()
            });
        });
        
        // Timeout after 30 seconds
        const timeout = setTimeout(() => {
            if (!responseSent) {
                child.kill();
                sendResponse({
                    success: false,
                    error: 'Test execution timed out',
                    output: output,
                    errorOutput: errorOutput,
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
        
        // Clear timeout when response is sent
        timeout.unref();
        
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Customer REST API Server',
        endpoints: {
            'GET /customers': 'Get all customers',
            'GET /customers/:id': 'Get customer by ID',
            'POST /customers': 'Create new customer',
            'PUT /customers/:id': 'Update customer by ID',
            'DELETE /customers/:id': 'Delete customer by ID',
            'POST /customers/reset': 'Reset customer collection to 3 example customers'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Initialize database connection and start server
async function startServer() {
    try {
        await dataAccess.initialize();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to see the API endpoints`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await dataAccess.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down server...');
    await dataAccess.shutdown();
    process.exit(0);
});

startServer();

module.exports = { getApiKey, validateApiKey };
