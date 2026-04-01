# Setup Instructions

## Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

## Installation Complete ✅

Dependencies have been installed for both backend and frontend:
- ✅ Backend: Express API with TypeScript
- ✅ Frontend: React with Vite
- ✅ All npm packages installed

## Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

Verify the database is running:
```bash
docker ps | grep marketplace-db
```

### 2. Initialize Database Schema
```bash
cd backend
npm run migrate
```

### 3. Start Development Servers
Open two terminals:

**Terminal 1 - Backend (port 3000)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 3001)**
```bash
cd frontend
npm run dev
```

## Development Workflow

### Building
```bash
npm run build        # Both backend and frontend
npm run build -w backend
npm run build -w frontend
```

### Testing
```bash
npm run test         # All tests
cd backend && npm test
cd frontend && npm test
```

### Linting & Type Checking
```bash
npm run lint         # Lint both
npm run type-check   # Type check both
```

## API Endpoints

**Health Check:**
- `GET http://localhost:3000/api/health`

**Workspaces:**
- `GET http://localhost:3000/api/workspaces`
- `GET http://localhost:3000/api/workspaces/:id`
- `GET http://localhost:3000/api/workspaces/search/location?location=...`
- `POST http://localhost:3000/api/workspaces`

**Bookings:**
- `GET http://localhost:3000/api/bookings/:id`
- `POST http://localhost:3000/api/bookings`
- `PATCH http://localhost:3000/api/bookings/:id/status`

## Testing the API

```bash
# Test health check
curl http://localhost:3000/api/health

# List workspaces
curl http://localhost:3000/api/workspaces
```

## Database Management

**View logs:**
```bash
docker-compose logs -f postgres
```

**Connect to PostgreSQL:**
```bash
docker-compose exec postgres psql -U postgres -d marketplace_db
```

**Stop services:**
```bash
docker-compose down
```

## Frontend URLs

- **Home**: http://localhost:3001
- **Browse**: http://localhost:3001/workspaces (when routing is added)

## Next Steps

1. Implement authentication (JWT)
2. Add Socket.io for real-time updates
3. Implement WebSocket connections
4. Build pricing engine
5. Add demand prediction features
6. Implement smart recommendations

## Troubleshooting

**Port already in use:**
```bash
# Change port in backend/.env or frontend/vite.config.ts
```

**Database connection error:**
- Verify PostgreSQL is running: `docker ps`
- Check .env file has correct DB credentials
- Ensure port 5432 is not blocked

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install  # or reinstall individual packages
```
