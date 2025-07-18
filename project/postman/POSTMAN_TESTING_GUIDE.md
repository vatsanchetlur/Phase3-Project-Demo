# Testing the Customer REST API with Postman

## 📋 Prerequisites

1. **Start the server**: Run `npm start` in the project directory
2. **Install Postman**: Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
3. **Import Collection**: Import the provided Postman collection file

## 🔧 Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Drag and drop the file `postman/Customer_REST_API.postman_collection.json`
4. Click "Import"

### 2. Server Setup
- Ensure your server is running on `http://localhost:4000`
- Verify MongoDB is running and accessible

## 🧪 Testing the POST Endpoint

### Create a New Customer
1. Select the "Create New Customer" request
2. Review the pre-configured JSON body:
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john.doe@example.com",
     "phone": "1234567890",
     "address": {
       "street": "123 Main St",
       "city": "New York",
       "state": "NY",
       "zipCode": "10001"
     }
   }
   ```
3. Click "Send"
4. Expected response: `201 Created` with customer data

### Test Data Validation
1. Select the "Test Validation Error" request
2. This includes invalid data to test validation:
   - Short first name
   - Empty last name
   - Invalid email format
   - Invalid phone number
   - Missing address fields
3. Click "Send"
4. Expected response: `400 Bad Request` with validation errors

### Test Duplicate Email Prevention
1. First create a customer with a unique email
2. Try to create another customer with the same email
3. Expected response: `400 Bad Request` with duplicate error

## 🔄 Full Testing Workflow

### Complete API Testing Sequence:

1. **Reset Database**: Use "Reset Database (GET)" to start fresh
2. **Get All Customers**: Should return 3 default customers
3. **Create New Customer**: Add a new customer using POST
4. **Get Customer by ID**: Copy an ID from previous response and test GET by ID
5. **Update Customer**: Use PUT to update the customer
6. **Delete Customer**: Use DELETE to remove the customer
7. **Verify Changes**: Get all customers to verify the changes

## 📝 Request Examples

### POST /customers (Create)
```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "phone": "5551234567",
  "address": {
    "street": "789 Oak Street",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101"
  }
}
```

### PUT /customers/:id (Update)
```json
{
  "firstName": "Alice Updated",
  "email": "alice.updated@example.com",
  "phone": "5559876543"
}
```

## ✅ Expected Responses

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "phone": "5551234567",
    "address": {
      "street": "789 Oak Street",
      "city": "Seattle",
      "state": "WA",
      "zipCode": "98101"
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Validation Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Please check the provided data",
  "errors": [
    "First name is required and must be at least 2 characters long",
    "Last name is required and must be at least 2 characters long",
    "Valid email is required",
    "Valid phone number is required",
    "Complete address is required"
  ]
}
```

### Duplicate Email Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Duplicate Entry",
  "message": "A customer with this email already exists"
}
```

## 🎯 Testing Tips

1. **Always test with valid data first** to ensure the endpoint works
2. **Test edge cases** like empty fields, invalid formats, and duplicate data
3. **Use the reset endpoint** to start fresh when needed
4. **Check response status codes** to verify proper HTTP semantics
5. **Save successful customer IDs** to use in other requests

## 🚀 Additional Testing

You can also test the API using:
- **cURL commands** (see examples in the project documentation)
- **Browser** for GET requests (visit http://localhost:4000/customers)
- **Custom test scripts** (see test-post-endpoint.js in the project)

Happy testing! 🎉
