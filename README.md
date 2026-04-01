# Marketplace Platform - Airbnb for Workspaces

A full-stack TypeScript marketplace platform for discovering, booking, and managing workspaces with real-time features and smart recommendations.

## 🌐 Features

### Core Tools
- 🏢 **Workspace Listing** - Browse and search available workspaces
- 📅 **Real-time Booking** - Instant booking with confirmation
- 💰 **Dynamic Pricing Engine** - Intelligent price adjustments
- 📍 **Location + Filtering** - Search by location, capacity, amenities
- ⏰ **Availability Scheduler** - Real-time availability tracking

### Smart Features
- 🧠 **Demand Prediction** - AI-powered occupancy forecasting
- 🎯 **Smart Recommendations** - Personalized workspace suggestions
- 📈 **Occupancy Optimization** - Revenue maximization tools

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates

### Backend
- **Node.js** + **Express** with TypeScript
- **PostgreSQL** - Primary database
- **Socket.io** - Real-time communication
- **Zod** - Schema validation
- **JWT** - Authentication

### Database
- **PostgreSQL 15** - Relational database
- Type-safe migrations
- Optimized indexes for performance

## 📁 Project Structure

```
marketplace-platform/
├── backend/          # Express API server
├── frontend/         # React application
├── database/         # PostgreSQL schemas
├── package.json      # Monorepo configuration (pnpm workspaces)
├── tsconfig.json     # Shared TypeScript config
└── .github/
    └── copilot-instructions.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (using Docker)
docker run -d \
  --name marketplace-db \
  -e POSTGRES_DB=marketplace_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine

# Initialize database
pnpm -F backend migrate
```

### Development

```bash
# Start both frontend and backend in development mode
pnpm dev

# Or start individually
pnpm -F backend dev      # Backend on http://localhost:3000
pnpm -F frontend dev     # Frontend on http://localhost:3001
```

### Build

```bash
pnpm build
```

## 📚 API Endpoints

### Workspaces
- `GET /api/workspaces` - List all workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `GET /api/workspaces/search/location?location=...` - Search by location
- `POST /api/workspaces` - Create workspace

### Bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status

### System
- `GET /api/health` - Health check

## 🔧 Environment Variables

### Backend (.env)
```
PORT=3000
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📦 Dependencies

See individual `package.json` files in:
- `/backend/package.json`
- `/frontend/package.json`

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm -F backend vitest --ui
pnpm -F frontend vitest --ui
```

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (guest, host, admin)

## 📊 Database Schema

### Users
- id, email, name, password_hash, role, timestamps

### Workspaces
- id, name, description, location, coordinates, capacity, hourlyRate, amenities, images, ownerId, timestamps

### Bookings
- id, workspaceId, guestId, startDate, endDate, totalPrice, status, timestamps

### Pricing Rules
- id, workspaceId, dayOfWeek, seasonType, multiplier, timestamps

### Availability
- id, workspaceId, date, available, bookings, timestamps

## 🚀 Deployment

The project is containerizable and can be deployed to:
- Docker + Docker Compose
- Vercel (frontend)
- Railway/Heroku (backend)
- AWS/GCP/Azure (scalable infrastructure)

## 📝 License

MIT

## 👥 Contributing

1. Create a feature branch
2. Commit changes
3. Push to the branch
4. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.
