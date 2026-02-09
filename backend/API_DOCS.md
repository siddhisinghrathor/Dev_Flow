# DevFlow API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe",
  "persona": "fullstack" // optional: frontend, backend, fullstack, other
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "John Doe",
      "persona": "fullstack"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Refresh Token

```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer TOKEN
```

**Request Body (optional):**
```json
{
  "refreshToken": "token-to-invalidate"
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer TOKEN
```

---

## ✅ Task Endpoints

### Create Task

```http
POST /tasks
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the backend API",
  "category": "backend", // frontend, backend, dsa, health, career, general
  "priority": "high", // low, medium, high
  "duration": 120, // minutes
  "dueDate": "2024-12-31T23:59:59Z", // optional
  "scheduledFor": "2024-12-25T09:00:00Z", // optional
  "recurrence": "none", // none, daily, weekly, custom
  "goalId": "uuid", // optional
  "playlistId": "uuid" // optional
}
```

### Get All Tasks

```http
GET /tasks?status=planned&category=backend&page=1&limit=20
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `status`: planned, completed, failed, skipped, suggested
- `category`: frontend, backend, dsa, health, career, general
- `priority`: low, medium, high
- `goalId`: UUID
- `playlistId`: UUID
- `startDate`: ISO date
- `endDate`: ISO date
- `page`: number (default: 1)
- `limit`: number (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Get Today's Tasks

```http
GET /tasks/today
Authorization: Bearer TOKEN
```

### Get Active Task

```http
GET /tasks/active
Authorization: Bearer TOKEN
```

Returns the task with an active timer.

### Get Task by ID

```http
GET /tasks/:taskId
Authorization: Bearer TOKEN
```

### Update Task

```http
PATCH /tasks/:taskId
Authorization: Bearer TOKEN
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "status": "completed",
  "priority": "low"
}
```

### Delete Task

```http
DELETE /tasks/:taskId
Authorization: Bearer TOKEN
```

Soft deletes the task.

### Bulk Update Status

```http
POST /tasks/bulk-update
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "taskIds": ["uuid1", "uuid2"],
  "status": "completed"
}
```

### Get Task Statistics

```http
GET /tasks/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "completed": 75,
    "failed": 10,
    "skipped": 5,
    "planned": 10,
    "completionRate": 75
  }
}
```

---

## 📊 Analytics Endpoints

### Get Dashboard Stats

```http
GET /analytics/dashboard
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "total": 5,
      "completed": 3,
      "failed": 1,
      "completionRate": 60
    },
    "week": {
      "total": 25,
      "completed": 18,
      "completionRate": 72
    },
    "month": {
      "total": 100,
      "completed": 75,
      "completionRate": 75
    },
    "activeGoals": 3,
    "streak": 7,
    "productivityScore": 85
  }
}
```

### Get Heatmap Data

```http
GET /analytics/heatmap?year=2024
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "2024-01-15": 5,
    "2024-01-16": 3,
    "2024-01-17": 7
  }
}
```

### Get Productivity Trends

```http
GET /analytics/trends?days=30
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "created": 5,
      "completed": 4,
      "failed": 1
    }
  ]
}
```

### Get Category Breakdown

```http
GET /analytics/category-breakdown?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "frontend": {
      "count": 25,
      "timeSpent": 45000
    },
    "backend": {
      "count": 30,
      "timeSpent": 54000
    }
  }
}
```

### Get Weekly Summary

```http
GET /analytics/weekly-summary
Authorization: Bearer TOKEN
```

---

## 🎯 Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Task not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 🔌 WebSocket Events

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events from Server

- `task:updated` - Task was updated
- `timer:updated` - Timer state changed
- `goal:updated` - Goal was updated
- `notification:new` - New notification

### Events to Server

- `timer:sync` - Sync timer state
- `task:update` - Update task

### Example

```javascript
// Listen for task updates
socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
  // Update UI
});

// Send task update
socket.emit('task:update', {
  taskId: 'uuid',
  status: 'completed'
});
```

---

## 📝 Data Models

### Task

```typescript
{
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'frontend' | 'backend' | 'dsa' | 'health' | 'career' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'completed' | 'failed' | 'skipped' | 'suggested';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  scheduledFor?: Date;
  duration?: number; // minutes
  timeSpent: number; // seconds
  recurrence: 'none' | 'daily' | 'weekly' | 'custom';
  goalId?: string;
  playlistId?: string;
}
```

### User

```typescript
{
  id: string;
  email: string;
  username: string;
  avatar?: string;
  persona: 'frontend' | 'backend' | 'fullstack' | 'other';
  dailyTarget: number;
  weeklyTarget: number;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  autoCompleteOnTimerEnd: boolean;
  soundEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
```

---

## 🔄 Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Response**: 429 Too Many Requests

---

## 🛡️ Security

- All passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- HTTPS recommended for production
- CORS enabled for specified origins only
