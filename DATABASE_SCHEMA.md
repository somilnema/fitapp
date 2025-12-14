# FitPlanHub Database Schema

## Database Type

SQLite (better-sqlite3) - File-based relational database

## Database File Location

`backend/fitplanhub.db` (created automatically on first run)

## Entity Relationship Diagram

```
Users (1) ────< (N) Fitness Plans
  │
  │ (N)
  │
  └───< User Follows >─── (N) Users (as Trainers)
  │
  │ (N)
  │
  └───< (N) Subscriptions >─── (N) Fitness Plans
```

## Tables

### 1. users

Stores all user accounts (both regular users and trainers).

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier
- `name` (TEXT, NOT NULL) - User's full name
- `email` (TEXT, NOT NULL, UNIQUE) - Email address
- `password` (TEXT, NOT NULL) - Bcrypt hashed password
- `role` (TEXT, NOT NULL, CHECK IN ('user', 'trainer')) - User role
- `bio` (TEXT, DEFAULT '') - Optional biography
- `createdAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Creation timestamp
- `updatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Update timestamp

**Indexes:**
- `idx_users_email` on `email` - For fast email lookups

**Constraints:**
- Email must be unique
- Role must be either 'user' or 'trainer'

### 2. fitness_plans

Stores all fitness plans created by trainers.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier
- `title` (TEXT, NOT NULL) - Plan title
- `description` (TEXT, NOT NULL) - Detailed description
- `price` (REAL, NOT NULL, CHECK >= 0) - Price in dollars
- `duration` (INTEGER, NOT NULL, CHECK >= 1) - Duration in days
- `trainer_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to users.id
- `createdAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Creation timestamp
- `updatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Update timestamp

**Foreign Keys:**
- `trainer_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `idx_fitness_plans_trainer` on `trainer_id` - For efficient trainer queries

**Constraints:**
- Price must be non-negative
- Duration must be at least 1 day
- Deleting a trainer automatically deletes all their plans

### 3. subscriptions

Tracks which users have subscribed to which plans.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to users.id
- `plan_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to fitness_plans.id
- `subscribedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Subscription timestamp
- `createdAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Creation timestamp
- `updatedAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Update timestamp

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `plan_id` → `fitness_plans(id)` ON DELETE CASCADE

**Unique Constraints:**
- `UNIQUE(user_id, plan_id)` - Prevents duplicate subscriptions

**Indexes:**
- `idx_subscriptions_user` on `user_id` - For user subscription queries
- `idx_subscriptions_plan` on `plan_id` - For plan subscription queries

**Constraints:**
- A user cannot subscribe to the same plan twice
- Deleting a user or plan automatically removes related subscriptions

### 4. user_follows

Manages the many-to-many relationship between users and trainers they follow.

**Columns:**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT) - Unique identifier
- `user_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to users.id (follower)
- `trainer_id` (INTEGER, NOT NULL, FOREIGN KEY) - Reference to users.id (trainer)
- `createdAt` (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Follow timestamp

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `trainer_id` → `users(id)` ON DELETE CASCADE

**Unique Constraints:**
- `UNIQUE(user_id, trainer_id)` - Prevents duplicate follow relationships

**Indexes:**
- `idx_user_follows_user` on `user_id` - For user's followed trainers queries
- `idx_user_follows_trainer` on `trainer_id` - For trainer's followers queries

**Constraints:**
- A user cannot follow the same trainer twice
- Users can follow multiple trainers
- Deleting a user automatically removes all their follow relationships

## Relationships

### One-to-Many
- **Users → Fitness Plans**: One trainer can create many plans
- **Users → Subscriptions**: One user can have many subscriptions
- **Users → User Follows (as follower)**: One user can follow many trainers

### Many-to-Many
- **Users ↔ Fitness Plans**: Through Subscriptions table
- **Users ↔ Users (as Trainers)**: Through User Follows table

## Data Integrity

- Foreign key constraints ensure referential integrity
- CASCADE deletes maintain consistency when parent records are deleted
- Unique constraints prevent duplicate relationships
- CHECK constraints ensure data validity (non-negative prices, valid roles, etc.)

## Performance Optimizations

- Indexes on foreign keys for fast joins
- Index on email for quick user lookups
- Composite indexes where appropriate for query optimization

## Database Initialization

The database is automatically initialized when the server starts. The `database.js` file creates all tables, indexes, and constraints if they don't already exist.

## Backup Recommendations

Since SQLite is a file-based database:
- Regularly backup the `fitplanhub.db` file
- Consider implementing automated backups for production
- The database file can be copied directly for backup/restore operations
