# Database

PostgreSQL database schema and migrations for the marketplace platform.

## Schema

### Tables

- **users** - User accounts (guests, hosts, admins)
- **workspaces** - Workspace listings
- **bookings** - Booking records
- **pricing_rules** - Dynamic pricing configurations
- **availability** - Workspace availability tracking

## Setup

### Using Docker

```bash
docker run -d \
  --name marketplace-db \
  -e POSTGRES_DB=marketplace_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

### Environment Variables

```
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace_db
```

## Connection

After starting the database, run migrations:

```bash
cd backend
pnpm migrate
```
