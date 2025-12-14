# FitPlanHub API Design Document

## Overview

The FitPlanHub API is a RESTful web service built with Node.js and Express.js. It provides endpoints for user authentication, fitness plan management, subscription handling, and social features like following trainers.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through the login or signup endpoints and expire after 7 days.

## API Endpoints Summary

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

### Fitness Plans Endpoints
- `GET /plans` - List all plans (public)
- `GET /plans/:id` - Get plan details (public)
- `POST /plans` - Create plan (trainer only)
- `PUT /plans/:id` - Update plan (trainer only, own plans)
- `DELETE /plans/:id` - Delete plan (trainer only, own plans)
- `GET /plans/trainer/my-plans` - Get trainer's plans (trainer only)

### Subscription Endpoints
- `POST /subscriptions` - Subscribe to plan (user only)
- `GET /subscriptions/my-subscriptions` - Get user subscriptions (user only)
- `GET /subscriptions/check?planId=:id` - Check subscription status (user only)

### User & Trainer Endpoints
- `POST /users/follow` - Follow trainer (user only)
- `POST /users/unfollow` - Unfollow trainer (user only)
- `GET /users/followed-trainers` - Get followed trainers (user only)
- `GET /users/trainer/:id` - Get trainer profile (public, optional auth)
- `GET /users/feed` - Get personalized feed (user only)

## Request/Response Format

All requests and responses use JSON format. Content-Type header should be set to `application/json` for POST/PUT requests.

## Error Responses

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "message": "Error description"
}
```

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider adding rate limiting to prevent abuse.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins. In production, restrict this to your frontend domain.

## Data Validation

- Email addresses must be unique
- Passwords must be at least 6 characters
- Plan prices must be non-negative
- Plan duration must be at least 1 day
- User roles must be either 'user' or 'trainer'

## Security Considerations

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are signed with a secret key
- SQL injection protection through parameterized queries
- Foreign key constraints ensure data integrity
- CASCADE deletes maintain referential integrity

## Database Relationships

- Users can have many Fitness Plans (one-to-many)
- Users can subscribe to many Plans (many-to-many via Subscriptions)
- Users can follow many Trainers (many-to-many via User Follows)
- Plans belong to one Trainer (many-to-one)

## Testing

Use the provided Postman collection (`postman/FitPlanHub_API.postman_collection.json`) to test all endpoints. The collection includes example requests and automatically handles token management.
