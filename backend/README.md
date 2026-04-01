# Backend

Node.js + Express API server for the marketplace platform.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Database

Initialize schema:
```bash
pnpm migrate
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/workspaces` - List all workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `GET /api/workspaces/search/location?location=...` - Search by location
- `POST /api/workspaces` - Create workspace
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status
