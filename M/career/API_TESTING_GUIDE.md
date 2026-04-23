# Career Bridge - API Testing Guide

This guide helps you test all API endpoints using curl, Postman, or similar tools.

## Base URL

```
http://localhost:5000/api
```

## Setup for Testing

### 1. Signup a Test User

First, create a test user:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Save the token** - you'll need it for authenticated requests:
```bash
TOKEN="your_token_here"
```

### 2. Create Admin User

Create an admin for testing admin endpoints:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

Save this admin token as well:
```bash
ADMIN_TOKEN="admin_token_here"
```

---

## Authentication Endpoints

### POST /auth/signup - Register User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "university"
  }'
```

**Roles available:** student, university, employer, admin

---

### POST /auth/login - Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response includes `token` - save for future requests.

---

## User Management Endpoints (Admin Only)

### GET /users - Get All Users

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Response: Array of all users

---

### POST /users - Create New User (Admin)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "password": "password123",
    "role": "employer"
  }'
```

---

### PUT /users/:id - Update User (Admin)

Replace `:id` with actual user ID:

```bash
curl -X PUT http://localhost:5000/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "admin"
  }'
```

---

### DELETE /users/:id - Delete User (Admin)

```bash
curl -X DELETE http://localhost:5000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Question Endpoints

### GET /questions - Get All Questions

Public endpoint - no authentication needed:

```bash
curl -X GET http://localhost:5000/api/questions
```

Response: Array of all questions with details

---

### POST /questions - Create Question

Requires authentication:

```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "How to start my career in tech?",
    "description": "I'm a recent graduate and want to break into software development. What steps should I take?"
  }'
```

Response: Created question object

---

### POST /questions/:id/upvote - Upvote Question

```bash
curl -X POST http://localhost:5000/api/questions/507f1f77bcf86cd799439011/upvote \
  -H "Authorization: Bearer $TOKEN"
```

Toggles upvote (removes if already upvoted, adds if not)

---

### DELETE /questions/:id - Delete Question

Only question owner or admin can delete:

```bash
curl -X DELETE http://localhost:5000/api/questions/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Feedback Endpoints

### GET /feedback - Get All Feedback

Public endpoint:

```bash
curl -X GET http://localhost:5000/api/feedback
```

---

### POST /feedback - Submit Feedback

Requires authentication:

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Great platform! Would love to see more resources for career planning."
  }'
```

---

### PATCH /feedback/:id - Update Feedback Status (Admin)

Change feedback status:

```bash
curl -X PATCH http://localhost:5000/api/feedback/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "in-progress",
    "response": "Thanks for the feedback! We are working on this."
  }'
```

**Status options:** pending, in-progress, resolved

---

### DELETE /feedback/:id - Delete Feedback

```bash
curl -X DELETE http://localhost:5000/api/feedback/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

### 1. Import Collection

Create requests for each endpoint with:
- **Method** (GET, POST, etc.)
- **URL** (e.g., `{{base_url}}/api/questions`)
- **Headers**: `Content-Type: application/json`
- **Authorization Header**: `Authorization: Bearer {{token}}`

### 2. Use Variables

Set up Postman variables:
```
base_url: http://localhost:5000/api
token: [your_token_here]
admin_token: [admin_token_here]
```

### 3. Pre-request Script

Auto-save token after signup/login:
```javascript
let jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

---

## Error Handling

API returns appropriate HTTP status codes:

```
200 - OK (Success)
201 - Created (Resource created)
400 - Bad Request (Invalid input)
401 - Unauthorized (Missing/invalid token)
403 - Forbidden (Insufficient permissions)
404 - Not Found (Resource doesn't exist)
500 - Server Error
```

Error response format:
```json
{
  "message": "Error description"
}
```

---

## Expected Responses

### User Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Question Object
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "How to start my career?",
  "description": "...",
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "answers": [],
  "upvotes": 5,
  "upvoters": ["507f1f77bcf86cd799439011"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Feedback Object
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "message": "Great platform!",
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "status": "pending",
  "response": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Batch Testing Script

Run this bash script to test all endpoints:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

# Test signup
echo "Testing signup..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Test get questions
echo "Testing get questions..."
curl -X GET $BASE_URL/questions

# Test create question
echo "Testing create question..."
curl -X POST $BASE_URL/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Question",
    "description": "This is a test question"
  }'

# Test submit feedback
echo "Testing submit feedback..."
curl -X POST $BASE_URL/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Test feedback"
  }'

echo "Tests completed!"
```

---

## Troubleshooting

### Invalid Token
- Make sure token is correct
- Check token hasn't expired (7 days)
- Try logging in again

### CORS Error
- Ensure backend is running on port 5000
- Check cors() middleware in backend
- Restart both frontend and backend

### MongoDB Not Found
- Ensure mongod is running
- Check MONGODB_URI in .env
- Verify connection credentials

### Route Not Found (404)
- Check exact endpoint path
- Verify method (GET, POST, etc.)
- Check if backend is running

---

## Quick Testing Checklist

- [ ] Signup endpoint works
- [ ] Login endpoint works
- [ ] Token stored correctly
- [ ] Create question works
- [ ] Get questions works
- [ ] Upvote question works
- [ ] Submit feedback works
- [ ] Get feedback works
- [ ] Admin can create user
- [ ] Admin can delete user
- [ ] Non-admin cannot access admin endpoints
- [ ] Unauthenticated users cannot create questions

---

Happy testing! 🚀
