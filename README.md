# FitPlanHub - Fitness Training Platform

FitPlanHub is a comprehensive web application that connects fitness trainers with users looking for personalized workout plans. Trainers can create and manage fitness plans, while users can browse, subscribe to plans, follow their favorite trainers, and access a personalized feed.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing with Postman](#testing-with-postman)
- [Usage Guide](#usage-guide)
- [Additional Documentation](#additional-documentation)

## Features

### For Trainers
- Create custom fitness plans with detailed descriptions
- Edit and update existing plans
- Delete plans when needed
- View all plans created in a dedicated dashboard
- Manage pricing and duration for each plan

### For Users
- Browse all available fitness plans from different trainers
- Subscribe to plans to access full content
- Follow favorite trainers to stay updated
- Unfollow trainers anytime
- View personalized feed with plans from followed trainers
- See all purchased subscriptions in one place
- View detailed trainer profiles

### Authentication & Security
- Secure user registration and login
- Role-based access control (User/Trainer)
- JWT token authentication
- Password hashing with bcrypt
- Protected API endpoints

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite** - Lightweight relational database (better-sqlite3)
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing library
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS** - Styling and layout

## Database Schema

The application uses SQLite database with the following table structure:

### Users Table
Stores all user accounts including both regular users and trainers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| name | TEXT | NOT NULL | User's full name |
| email | TEXT | NOT NULL, UNIQUE | Email address (unique) |
| password | TEXT | NOT NULL | Hashed password |
| role | TEXT | NOT NULL, CHECK | User role: 'user' or 'trainer' |
| bio | TEXT | DEFAULT '' | Optional biography |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_users_email` on `email` column for fast email lookups

### Fitness Plans Table
Stores all fitness plans created by trainers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique plan identifier |
| title | TEXT | NOT NULL | Plan title |
| description | TEXT | NOT NULL | Detailed plan description |
| price | REAL | NOT NULL, CHECK (>= 0) | Plan price in dollars |
| duration | INTEGER | NOT NULL, CHECK (>= 1) | Duration in days |
| trainer_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to users table |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Plan creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `trainer_id` references `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_fitness_plans_trainer` on `trainer_id` for efficient trainer plan queries

### Subscriptions Table
Tracks which users have subscribed to which plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique subscription identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to users table |
| plan_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to fitness_plans table |
| subscribedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Subscription timestamp |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE
- `plan_id` references `fitness_plans(id)` ON DELETE CASCADE

**Unique Constraints:**
- `UNIQUE(user_id, plan_id)` - Prevents duplicate subscriptions

**Indexes:**
- `idx_subscriptions_user` on `user_id`
- `idx_subscriptions_plan` on `plan_id`

### User Follows Table
Manages the many-to-many relationship between users and trainers they follow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique follow relationship identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to users table (follower) |
| trainer_id | INTEGER | NOT NULL, FOREIGN KEY | Reference to users table (trainer) |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Follow relationship timestamp |

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE
- `trainer_id` references `users(id)` ON DELETE CASCADE

**Unique Constraints:**
- `UNIQUE(user_id, trainer_id)` - Prevents duplicate follow relationships

**Indexes:**
- `idx_user_follows_user` on `user_id`
- `idx_user_follows_trainer` on `trainer_id`

## API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require an Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register New User
**POST** `/auth/signup`

Creates a new user account. Available roles: 'user' or 'trainer'.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid role
- `400` - Email already registered

#### User Login
**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials

#### Get User Profile
**GET** `/auth/profile`

Returns the authenticated user's profile information.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "bio": "",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401` - No token provided or invalid token

### Fitness Plans Endpoints

#### Get All Plans
**GET** `/plans`

Retrieves all available fitness plans with trainer information.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "30-Day Weight Loss Program",
    "description": "Comprehensive weight loss plan...",
    "price": 49.99,
    "duration": 30,
    "trainer": {
      "id": 2,
      "name": "Jane Trainer",
      "email": "jane@example.com",
      "bio": "Certified fitness instructor"
    },
    "trainer_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Plan by ID
**GET** `/plans/:id`

Retrieves detailed information about a specific fitness plan.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "30-Day Weight Loss Program",
  "description": "Full description...",
  "price": 49.99,
  "duration": 30,
  "trainer": {
    "id": 2,
    "name": "Jane Trainer",
    "email": "jane@example.com",
    "bio": "Certified fitness instructor"
  },
  "trainer_id": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404` - Plan not found

#### Create New Plan
**POST** `/plans`

Creates a new fitness plan. Requires trainer authentication.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `trainer` (required)

**Request Body:**
```json
{
  "title": "Strength Training Basics",
  "description": "A comprehensive guide to building strength...",
  "price": 39.99,
  "duration": 21
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "title": "Strength Training Basics",
  "description": "A comprehensive guide to building strength...",
  "price": 39.99,
  "duration": 21,
  "trainer": {
    "id": 2,
    "name": "Jane Trainer",
    "email": "jane@example.com"
  },
  "trainer_id": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Authentication required
- `403` - Access denied (not a trainer)

#### Update Plan
**PUT** `/plans/:id`

Updates an existing fitness plan. Trainers can only update their own plans.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `trainer` (required)

**Request Body:**
```json
{
  "title": "Updated Plan Title",
  "price": 59.99
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "title": "Updated Plan Title",
  "description": "Original description...",
  "price": 59.99,
  "duration": 21,
  "trainer": {
    "id": 2,
    "name": "Jane Trainer",
    "email": "jane@example.com",
    "bio": "Certified fitness instructor"
  },
  "trainer_id": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Error Responses:**
- `403` - Can only edit your own plans
- `404` - Plan not found

#### Delete Plan
**DELETE** `/plans/:id`

Deletes a fitness plan. Trainers can only delete their own plans.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `trainer` (required)

**Response (200 OK):**
```json
{
  "message": "Plan deleted successfully"
}
```

**Error Responses:**
- `403` - Can only delete your own plans
- `404` - Plan not found

#### Get Trainer's Plans
**GET** `/plans/trainer/my-plans`

Retrieves all plans created by the authenticated trainer.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `trainer` (required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "30-Day Weight Loss Program",
    "description": "...",
    "price": 49.99,
    "duration": 30,
    "trainer": {
      "id": 2,
      "name": "Jane Trainer",
      "email": "jane@example.com"
    },
    "trainer_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Subscription Endpoints

#### Subscribe to Plan
**POST** `/subscriptions`

Subscribes the authenticated user to a fitness plan.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Request Body:**
```json
{
  "planId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "user_id": 1,
  "plan": {
    "id": 1,
    "title": "30-Day Weight Loss Program",
    "price": 49.99,
    "duration": 30,
    "description": "..."
  },
  "plan_id": 1,
  "subscribedAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Plan ID required or already subscribed
- `404` - Plan not found

#### Get User Subscriptions
**GET** `/subscriptions/my-subscriptions`

Retrieves all plans the authenticated user has subscribed to.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "user_id": 1,
    "plan": {
      "id": 1,
      "title": "30-Day Weight Loss Program",
      "description": "...",
      "price": 49.99,
      "duration": 30
    },
    "plan_id": 1,
    "subscribedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Check Subscription Status
**GET** `/subscriptions/check?planId=1`

Checks if the authenticated user is subscribed to a specific plan.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Query Parameters:**
- `planId` (required) - The ID of the plan to check

**Response (200 OK):**
```json
{
  "isSubscribed": true
}
```

### User & Trainer Endpoints

#### Follow Trainer
**POST** `/users/follow`

Follows a trainer. Users can follow multiple trainers.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Request Body:**
```json
{
  "trainerId": 2
}
```

**Response (200 OK):**
```json
{
  "message": "Trainer followed successfully",
  "followedTrainers": [
    {
      "id": 2,
      "name": "Jane Trainer",
      "email": "jane@example.com",
      "role": "trainer",
      "bio": "Certified fitness instructor",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_id": 2
    }
  ]
}
```

**Error Responses:**
- `400` - Trainer ID required or already following
- `404` - Trainer not found

#### Unfollow Trainer
**POST** `/users/unfollow`

Unfollows a trainer.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Request Body:**
```json
{
  "trainerId": 2
}
```

**Response (200 OK):**
```json
{
  "message": "Trainer unfollowed successfully",
  "followedTrainers": []
}
```

#### Get Followed Trainers
**GET** `/users/followed-trainers`

Retrieves a list of all trainers the authenticated user is following.

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Jane Trainer",
    "email": "jane@example.com",
    "role": "trainer",
    "bio": "Certified fitness instructor",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_id": 2
  }
]
```

#### Get Trainer Profile
**GET** `/users/trainer/:id`

Retrieves detailed information about a trainer including all their plans.

**URL Parameters:**
- `id` (required) - The trainer's user ID

**Headers:**
- `Authorization: Bearer <token>` (optional) - If provided, includes whether the user is following this trainer

**Response (200 OK):**
```json
{
  "trainer": {
    "id": 2,
    "name": "Jane Trainer",
    "email": "jane@example.com",
    "role": "trainer",
    "bio": "Certified fitness instructor",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_id": 2
  },
  "plans": [
    {
      "id": 1,
      "title": "30-Day Weight Loss Program",
      "description": "...",
      "price": 49.99,
      "duration": 30,
      "trainer": {
        "id": 2,
        "name": "Jane Trainer",
        "email": "jane@example.com",
        "bio": "Certified fitness instructor"
      },
      "trainer_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "isFollowing": false
}
```

**Error Responses:**
- `404` - Trainer not found

#### Get Personalized Feed
**GET** `/users/feed`

Retrieves a personalized feed for the authenticated user containing:
- Plans from trainers the user follows
- Plans the user has purchased/subscribed to

**Headers:**
- `Authorization: Bearer <token>` (required)
- Role: `user` (required)

**Response (200 OK):**
```json
[
  {
    "plan": {
      "id": 1,
      "title": "30-Day Weight Loss Program",
      "description": "...",
      "price": 49.99,
      "duration": 30,
      "trainer": {
        "id": 2,
        "name": "Jane Trainer",
        "email": "jane@example.com",
        "bio": "Certified fitness instructor"
      },
      "trainer_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "type": "followed_trainer",
    "isPurchased": false
  },
  {
    "plan": {
      "id": 3,
      "title": "Strength Training Basics",
      "description": "...",
      "price": 39.99,
      "duration": 21,
      "trainer": {
        "id": 2,
        "name": "Jane Trainer",
        "email": "jane@example.com",
        "bio": "Certified fitness instructor"
      },
      "trainer_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "type": "purchased",
    "isPurchased": true
  }
]
```

## Project Structure

```
fitpaln/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── planController.js
│   │   ├── subscriptionController.js
│   │   └── userController.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # Authentication & authorization
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── FitnessPlan.js
│   │   └── Subscription.js
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── planRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   └── userRoutes.js
│   ├── database.js           # SQLite database initialization
│   ├── server.js             # Express app entry point
│   ├── package.json
│   ├── .env                  # Environment variables (create this)
│   └── fitplanhub.db         # SQLite database file (auto-created)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── Navbar.js
│   │   ├── context/          # React context
│   │   │   └── AuthContext.js
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── TrainerDashboard.js
│   │   │   ├── PlanDetails.js
│   │   │   ├── UserFeed.js
│   │   │   ├── TrainerProfile.js
│   │   │   └── FollowedTrainers.js
│   │   ├── services/         # API service
│   │   │   └── api.js
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry point
│   └── package.json
├── .cursor/
│   └── debug.log             # Debug logs (if any)
├── postman/
│   └── FitPlanHub_API.postman_collection.json  # Postman API collection
├── API_DESIGN.md             # API design documentation
├── DATABASE_SCHEMA.md        # Database schema documentation
└── README.md                 # This file
```

## Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)
- Git (optional, for version control)

### Step 1: Clone or Download the Project

If you have the project in a Git repository:
```bash
git clone <repository-url>
cd fitpaln
```

Or simply navigate to the project directory if you already have it.

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install all required dependencies:
```bash
npm install
```

This will install all packages listed in `package.json` including Express, SQLite, JWT, and other dependencies.

3. Create environment configuration file:

Create a new file named `.env` in the `backend` directory with the following content:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a strong, random string in production. You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Database Setup:

The SQLite database will be created automatically when you first run the server. The database file `fitplanhub.db` will be created in the `backend` directory.

### Step 3: Frontend Setup

1. Navigate to the frontend directory (from project root):
```bash
cd frontend
```

2. Install all required dependencies:
```bash
npm install
```

3. Create environment configuration file (optional):

Create a `.env` file in the `frontend` directory if you want to customize the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If you don't create this file, the frontend will default to `http://localhost:5000/api`.

## Running the Application

### Starting the Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend directory:
```bash
cd backend
```

3. Start the server:

For development (with auto-reload on file changes):
```bash
npm run dev
```

Or for production:
```bash
npm start
```

You should see output like:
```
Database initialized successfully
Server running on port 5000
Using SQLite database
```

The backend API will be available at `http://localhost:5000`

### Starting the Frontend Application

1. Open a **new** terminal/command prompt (keep the backend running)
2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Start the React development server:
```bash
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, manually navigate to that URL.

### Verifying the Setup

1. **Backend Check:** Open `http://localhost:5000` in your browser. You should see:
```json
{"message":"FitPlanHub API is running"}
```

2. **Frontend Check:** The React app should load at `http://localhost:3000` showing the landing page with available fitness plans.

## Testing with Postman

A Postman collection is included in the `postman` directory for easy API testing.

### Importing the Collection

1. Open Postman application
2. Click "Import" button
3. Select the file: `postman/FitPlanHub_API.postman_collection.json`
4. The collection will be imported with all endpoints organized

### Using the Collection

1. **Set Environment Variables (Optional):**
   - Create a new environment in Postman
   - Add variable: `base_url` = `http://localhost:5000/api`
   - Add variable: `token` = (will be set automatically after login)

2. **Testing Flow:**
   - Start with `POST /auth/signup` to create a user account
   - Copy the `token` from the response
   - Use `POST /auth/login` to get a fresh token
   - Set the token in the Authorization header for protected endpoints
   - Test other endpoints as needed

3. **Authentication:**
   - Most endpoints require authentication
   - Use the "Authorization" tab in Postman
   - Select "Bearer Token" type
   - Paste your JWT token

### Collection Structure

The Postman collection includes:
- Authentication endpoints (signup, login, profile)
- Plans endpoints (CRUD operations)
- Subscription endpoints
- User/Trainer endpoints (follow, feed, etc.)

Each request includes example request bodies and expected responses.

## Usage Guide

### For New Users

1. **Registration:**
   - Click "Signup" on the homepage
   - Fill in your name, email, password, and select role (User or Trainer)
   - Click "Sign Up" to create your account
   - You'll be automatically logged in

2. **Login:**
   - If you already have an account, click "Login"
   - Enter your email and password
   - Click "Login" to access your account

### For Regular Users

1. **Browse Plans:**
   - View all available fitness plans on the homepage
   - Click "View Details" on any plan to see more information

2. **Subscribe to Plans:**
   - Click on a plan to view details
   - Click "Subscribe Now" button
   - You'll gain access to the full plan description

3. **Follow Trainers:**
   - Click on a trainer's name to view their profile
   - Click "Follow" button to start following them
   - Their plans will appear in your personalized feed

4. **View Your Feed:**
   - Click "My Feed" in the navigation bar
   - See plans from trainers you follow
   - See plans you've purchased

5. **Manage Followed Trainers:**
   - Click "Following" in the navigation bar
   - View all trainers you're following
   - Unfollow trainers if needed

### For Trainers

1. **Access Dashboard:**
   - After logging in as a trainer, click "Dashboard" in the navigation
   - View all your created plans

2. **Create a Plan:**
   - Click "Create New Plan" button
   - Fill in:
     - Title (e.g., "30-Day Weight Loss Program")
     - Description (detailed plan information)
     - Price (in dollars)
     - Duration (in days)
   - Click "Create Plan"

3. **Edit a Plan:**
   - Find the plan in your dashboard
   - Click "Edit" button
   - Update any fields
   - Click "Update Plan"

4. **Delete a Plan:**
   - Find the plan in your dashboard
   - Click "Delete" button
   - Confirm deletion

## Important Notes

- **Password Requirements:** Passwords must be at least 6 characters long
- **Role Restrictions:** 
  - Only trainers can create, edit, or delete plans
  - Only users can subscribe to plans and follow trainers
- **Ownership:** Trainers can only edit or delete their own plans
- **Subscriptions:** Users cannot subscribe to the same plan twice
- **Token Expiry:** JWT tokens expire after 7 days
- **Database:** The SQLite database file (`fitplanhub.db`) is created automatically and stores all data locally

## Troubleshooting

### Backend Issues

**Server won't start:**
- Check if port 5000 is already in use
- Verify Node.js is installed: `node --version`
- Check for syntax errors in `server.js`
- Ensure all dependencies are installed: `npm install`

**Database errors:**
- Check file permissions in the backend directory
- Ensure the directory is writable
- Delete `fitplanhub.db` to reset the database (will lose all data)

**Authentication errors:**
- Verify JWT_SECRET is set in `.env` file
- Check token expiration (tokens expire after 7 days)
- Ensure Authorization header format: `Bearer <token>`

### Frontend Issues

**App won't load:**
- Verify backend is running on port 5000
- Check browser console for errors (F12)
- Ensure React dependencies are installed: `npm install`

**API calls failing:**
- Verify backend server is running
- Check CORS settings (should be enabled)
- Verify API URL in `.env` file matches backend URL

**Login not working:**
- Check browser console for errors
- Verify token is being stored in localStorage
- Try clearing browser cache and localStorage

## Development Notes

- The backend uses SQLite for simplicity - no separate database server needed
- All database operations are synchronous using better-sqlite3
- Foreign key constraints ensure data integrity
- CASCADE deletes maintain referential integrity
- Indexes are created for optimal query performance
- JWT tokens are used for stateless authentication
- Password hashing uses bcrypt with 10 salt rounds

## Additional Documentation

For more detailed information, refer to these additional documentation files:

- **API_DESIGN.md** - Comprehensive API design documentation including endpoint details, authentication, error handling, and security considerations
- **DATABASE_SCHEMA.md** - Detailed database schema documentation with table structures, relationships, constraints, and indexes
- **postman/FitPlanHub_API.postman_collection.json** - Complete Postman collection for testing all API endpoints

## License

This project is provided as-is for educational and development purposes.
