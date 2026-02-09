# DevFlow Backend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Start Database Services

```bash
npm run docker:up
```

This starts PostgreSQL and Redis in Docker containers.

### Step 3: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with demo data
npm run prisma:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

Server will be running at `http://localhost:5000`

### Step 5: Test the API

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Login with demo account
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@devflow.com","password":"demo123456"}'
```

## 📝 Demo Credentials

- **Email**: demo@devflow.com
- **Password**: demo123456

## 🔧 Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Ensure Docker is running: `docker ps`
2. Check if PostgreSQL container is up: `docker-compose ps`
3. Verify DATABASE_URL in `.env` matches your setup

### Troubleshooting

#### Port Already in Use

The default configuration uses ports **5433** (PostgreSQL) and **6380** (Redis) to avoid conflicts with local installations.

If you detailed need to change them further:
1. Update `docker-compose.yml`
2. Update `.env` to match the new ports

### Prisma Client Not Generated

If you see "Cannot find module '@prisma/client'":

```bash
npm run prisma:generate
```

## 📊 Prisma Studio

View and edit your database visually:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

## 🧪 Testing API with Postman/Thunder Client

Import this collection or use these examples:

### Register User

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "username": "Test User",
  "persona": "fullstack"
}
```

### Create Task

```http
POST http://localhost:5000/api/v1/tasks
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Build amazing feature",
  "description": "Implement the new feature",
  "category": "backend",
  "priority": "high",
  "duration": 120
}
```

### Get Dashboard Stats

```http
GET http://localhost:5000/api/v1/analytics/dashboard
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🔄 Development Workflow

1. Make changes to code
2. Server auto-reloads (tsx watch)
3. Test endpoints
4. Check logs in `logs/` directory

## 📦 Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
NODE_ENV=production npm start
```

### Environment Variables for Production

Update these in your production `.env`:

- `NODE_ENV=production`
- `JWT_SECRET` - Use a strong random string
- `JWT_REFRESH_SECRET` - Use a different strong random string
- `DATABASE_URL` - Your production database URL
- `CORS_ORIGIN` - Your frontend production URL

## 🐳 Docker Deployment

### Build Docker Image

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t devflow-backend .
docker run -p 5000:5000 --env-file .env devflow-backend
```

## 📈 Monitoring

### Logs

- All logs: `logs/all.log`
- Error logs: `logs/error.log`
- Console: Real-time colored output

### Health Check

```bash
curl http://localhost:5000/api/v1/health
```

## 🔐 Security Checklist

- [ ] Change JWT secrets in production
- [ ] Use HTTPS in production
- [ ] Set appropriate CORS_ORIGIN
- [ ] Enable rate limiting
- [ ] Use strong database passwords
- [ ] Keep dependencies updated
- [ ] Enable database backups

## 📚 Next Steps

1. Integrate with frontend
2. Setup CI/CD pipeline
3. Configure monitoring (e.g., Sentry)
4. Setup automated backups
5. Add more comprehensive tests

## 🆘 Need Help?

- Check the main README.md
- Review API documentation
- Check logs in `logs/` directory
- Ensure all environment variables are set correctly
