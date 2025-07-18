# API Key Protection Implementation

## Overview

This Customer REST API now includes API key protection for all endpoints. This ensures that only authorized clients can access the API.

## Implementation Details

### 1. Environment Variable

The API key is stored in the `.env` file:
```
API_KEY=your-secret-api-key-here
```

### 2. Middleware Function

A middleware function `requireApiKey` checks the API key on every protected endpoint:

```javascript
function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API Key is missing',
            message: 'API Key is missing'
        });
    }
    
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'API Key is invalid',
            message: 'API Key is invalid'
        });
    }
    
    next();
}
```

### 3. Protected Endpoints

All customer endpoints now require API key authentication:

- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /reset` - Reset database
- `POST /customers/reset` - Reset database

### 4. Error Responses

- **401 Unauthorized**: When API key is missing
- **403 Forbidden**: When API key is invalid
- **200 OK**: When API key is valid

## Usage

### HTTP Headers

Include the API key in all requests:

```
x-api-key: your-secret-api-key-here
```

### Examples

#### cURL
```bash
curl -H "x-api-key: your-secret-api-key-here" http://localhost:4000/customers
```

#### JavaScript (fetch)
```javascript
fetch('/customers', {
    headers: {
        'x-api-key': 'your-secret-api-key-here'
    }
})
```

#### Axios
```javascript
axios.get('/customers', {
    headers: {
        'x-api-key': 'your-secret-api-key-here'
    }
})
```

## Testing

### API Key Test Script

Run the API key test to verify middleware functionality:

```bash
node test-api-key.js
```

This test validates:
- 401 error for missing API key
- 403 error for invalid API key
- 200 success for valid API key

### Web Interface

Click the "🔐 Test API Key" button in the web interface to run the API key tests.

## Security Considerations

1. **Environment Variables**: Keep API keys in environment variables, never in source code
2. **HTTPS**: In production, always use HTTPS to encrypt API key transmission
3. **Key Rotation**: Regularly rotate API keys
4. **Rate Limiting**: Consider implementing rate limiting alongside API key protection
5. **Logging**: Log API key usage for security monitoring

## Development Notes

- The current API key is set to `your-secret-api-key-here` for development
- All test scripts have been updated to include the API key
- The frontend interface handles API key authentication automatically
- Static files and test endpoints (like `/test-connection`) don't require API keys

## Postman Collection

Update your Postman collection to include the API key header:
1. Open the collection settings
2. Add a new header: `x-api-key: your-secret-api-key-here`
3. Set it to apply to all requests in the collection
