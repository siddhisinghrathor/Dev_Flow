# DevFlow Backend API

Production-grade Node.js backend for the DevFlow productivity platform. Built with TypeScript, Express, Prisma, PostgreSQL, and Socket.IO for real-time synchronization.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **Task Management**: Full CRUD with filtering, pagination, and bulk operations
- **Goals & Playlists**: Organize tasks into goals and reusable playlists
- **Timer Sessions**: Track time spent on tasks with pause/resume functionality
- **Real-time Sync**: WebSocket support for live updates across devices
- **Analytics**: Comprehensive dashboard stats, heatmaps, and productivity insights
- **Activity Logging**: Complete audit trail of user actions
- **Clean Architecture**: Services, controllers, and repositories pattern
- **Type Safety**: Full TypeScript with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS, rate limiting, and secure password hashing

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 7.x (optional, for queue management)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Start PostgreSQL and Redis using Docker:

```bash
npm run docker:up
```

Or manually configure your PostgreSQL instance and update the `DATABASE_URL` in `.env`.

### 3. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important**: Change the JWT secrets in production!

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. (Optional) Seed Database

```bash
npm run prisma:seed
```

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Production Mode

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Tasks

- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - Get all tasks (with filters)
- `GET /api/v1/tasks/today` - Get today's tasks
- `GET /api/v1/tasks/active` - Get active task (with running timer)
- `GET /api/v1/tasks/stats` - Get task statistics
- `GET /api/v1/tasks/:taskId` - Get task by ID
- `PATCH /api/v1/tasks/:taskId` - Update task
- `DELETE /api/v1/tasks/:taskId` - Delete task (soft delete)
- `POST /api/v1/tasks/bulk-update` - Bulk update task status

### Analytics

- `GET /api/v1/analytics/dashboard` - Dashboard statistics
- `GET /api/v1/analytics/heatmap` - Heatmap data for year
- `GET /api/v1/analytics/trends` - Productivity trends
- `GET /api/v1/analytics/category-breakdown` - Category breakdown
- `GET /api/v1/analytics/weekly-summary` - Weekly summary

### Health Check

- `GET /api/v1/health` - Server health status

## 🔌 WebSocket Events

### Client → Server

- `timer:sync` - Sync timer state
- `task:update` - Update task

### Server → Client

- `timer:updated` - Timer state changed
- `task:updated` - Task was updated
- `goal:updated` - Goal was updated
- `notification:new` - New notification

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
});
```

## 🗄️ Database Schema

The database includes the following main entities:

- **User**: User accounts and preferences
- **Task**: Individual tasks with status, priority, category
- **Goal**: Time-bound goals with progress tracking
- **Playlist**: Reusable task templates
- **TimerSession**: Time tracking sessions
- **Achievement**: User achievements and milestones
- **Notification**: User notifications
- **ActivityLog**: Audit trail of user actions
- **RefreshToken**: JWT refresh tokens

## 🏗️ Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── index.ts           # Configuration
│   │   └── database.ts        # Prisma client
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── middleware/            # Express middleware
│   ├── routes/                # API routes
│   ├── validators/            # Zod schemas
│   ├── utils/                 # Utilities
│   ├── websocket/             # WebSocket handlers
│   └── server.ts              # Main server file
├── .env                       # Environment variables
├── docker-compose.yml         # Docker services
├── package.json
└── tsconfig.json
```

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with short expiration (15 minutes)
- Refresh tokens stored in database
- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- SQL injection protection via Prisma

## 📊 Monitoring

- Winston logger with console transport
- Error tracking with stack traces (dev only)
- Database query logging (dev only)

## 🧪 Testing

```bash
npm test
```

## 🐳 Docker

Start all services:

```bash
npm run docker:up
```

Stop all services:

```bash
npm run docker:down
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Lint code

## 🤝 Contributing

1. Follow TypeScript and ESLint rules
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation

## 📄 License

MIT

## 🔗 Related

- Frontend: `../src` - React + TypeScript frontend
- Database: PostgreSQL with Prisma ORM
- Real-time: Socket.IO for WebSocket connections
