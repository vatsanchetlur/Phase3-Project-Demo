# Customer REST Server

A RESTful API server for managing customer records using NodeJS, Express, and MongoDB.

## Features

- Create new customers
- Read/retrieve customers (all or by ID)
- Update existing customers
- Delete customers
- MongoDB database integration
- RESTful API endpoints

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/custdb
     PORT=3000
     ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /customers
- Retrieve all customers
- Response: Array of customer objects

### GET /customers/:id
- Retrieve a specific customer by ID
- Response: Customer object

### POST /customers
- Create a new customer
- Request body: Customer object (JSON)
- Response: Created customer object with generated ID and timestamps
- Validation: All fields are required and validated
- Duplicate email check: Prevents creating customers with existing email addresses

**Example Request:**
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

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Validation Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Please check the provided data",
  "errors": [
    "First name is required and must be at least 2 characters long",
    "Valid email is required"
  ]
}
```

### PUT /customers/:id
- Update an existing customer
- Request body: Updated customer object
- Response: Updated customer object

### DELETE /customers/:id
- Delete a customer by ID
- Response: Success message

## Customer Object Structure

```json
{
  "_id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Technologies Used

- Node.js
- Express.js
- MongoDB with native MongoDB client
- CORS for cross-origin requests
- dotenv for environment configuration
- body-parser for parsing request bodies
