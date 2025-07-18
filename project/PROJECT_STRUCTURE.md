# Project Structure

```
customer-rest-server/
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── .vscode/               # VS Code tasks configuration
├── README.md              # Project documentation
├── package.json           # NPM dependencies and scripts
├── package-lock.json      # NPM lock file
├── server.js              # Main application entry point
├── data-access.js         # Data access layer
├── direct-access.js       # Direct MongoDB client access
├── setup.sh               # Setup script for easy installation
├── config/
│   └── config.js          # Environment-specific configuration
├── data/
│   ├── sampleCustomers.js # Sample customer data
│   └── seedDatabase.js    # Database seeding script
├── public/
│   └── index.html         # API documentation page
└── tests/
    └── customer.test.js   # API tests (Jest/Supertest)
```

## File Descriptions

### Core Files
- **server.js**: Main Express application with middleware setup and API routes
- **data-access.js**: Data access layer with validation and business logic
- **direct-access.js**: Direct MongoDB client operations (isolated database calls)
- **package.json**: Dependencies (Express, MongoDB client, body-parser, CORS, dotenv) and scripts
- **.env**: Environment variables (MongoDB URI, port, etc.)

### Database & Data Access
- **direct-access.js**: Direct MongoDB client operations (isolated MongoDB calls)
- **data-access.js**: Data access layer with validation and business logic
- **data/sampleCustomers.js**: Sample customer data for testing
- **data/seedDatabase.js**: Script to populate database with sample data

### API Routes
- **server.js**: Contains all REST endpoints directly
  - GET /customers (get all)
  - GET /customers/:id (get by ID)
  - POST /customers (create)
  - PUT /customers/:id (update)
  - DELETE /customers/:id (delete)

### Configuration
- **config/config.js**: Environment-specific settings for development/production
- **.gitignore**: Excludes node_modules, .env, and other sensitive files

### Documentation & Testing
- **public/index.html**: Interactive API documentation with examples
- **tests/customer.test.js**: Comprehensive API tests
- **README.md**: Project overview and setup instructions
- **setup.sh**: Automated setup script
