#!/bin/bash

# This script performs a direct curl PUT request to update a customer
# It avoids any Node.js child process issues

# Generate a unique name with timestamp
TIMESTAMP=$(date +%s)
UNIQUE_NAME="ShellCurl-$TIMESTAMP"
CUSTOMER_ID=1  # Using a known valid customer ID

echo "🔄 DIRECT SHELL CURL TEST"
echo "Updating customer $CUSTOMER_ID with name: $UNIQUE_NAME"

# Construct the JSON payload
JSON_DATA=$(cat <<EOF
{
  "firstName": "$UNIQUE_NAME",
  "lastName": "DirectShellCurl",
  "email": "sarah.wilson@example.com",
  "phone": "9999999999",
  "address": {
    "street": "999 Shell Curl St",
    "city": "Shell City",
    "state": "SC",
    "zipCode": "99999"
  }
}
EOF
)

# Execute the curl command
echo "Executing curl command..."
RESULT=$(curl -s -X PUT http://localhost:4000/customers/$CUSTOMER_ID \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-here" \
  -d "$JSON_DATA")

echo "Result: $RESULT"

# Verify the update
echo ""
echo "Verifying the update..."
VERIFY=$(curl -s -X GET http://localhost:4000/customers/$CUSTOMER_ID \
  -H "x-api-key: your-secret-api-key-here")

echo "GET verification: $VERIFY"

# Check MongoDB directly
echo ""
echo "Checking MongoDB directly..."
MONGO_RESULT=$(mongosh --quiet --eval "db = db.getSiblingDB('custdb'); JSON.stringify(db.customers.findOne({customerId: $CUSTOMER_ID}), null, 2)")

echo "MongoDB result: $MONGO_RESULT"

# Look for our update in MongoDB result
if [[ $MONGO_RESULT == *"$UNIQUE_NAME"* ]]; then
  echo "✅ VERIFIED: MongoDB contains our update with name: $UNIQUE_NAME"
else
  echo "❌ FAILED: MongoDB does not contain our update!"
fi

echo "✅ Direct curl test completed!"
