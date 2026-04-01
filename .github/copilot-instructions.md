# Marketplace Platform - Copilot Instructions

## Project Overview
Full-stack TypeScript marketplace platform (Airbnb for Workspaces) with real-time booking, dynamic pricing, and smart recommendations.

### Tech Stack
- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Real-time**: WebSockets via Socket.io
- **Package Manager**: pnpm (workspaces)

## Project Structure
- `/backend` - Express API server
- `/frontend` - React application
- `/database` - PostgreSQL schemas and migrations
- `/shared` - Shared types and utilities

## Development Workflow
1. Install dependencies: `pnpm install`
2. Start backend: `pnpm -F backend dev`
3. Start frontend: `pnpm -F frontend dev`
4. Database migrations: `pnpm -F backend migrate`

## Key Features to Implement
- Workspace listing and filtering
- Real-time booking system
- Dynamic pricing engine
- Availability scheduler
- Demand prediction
- Smart recommendations
- Occupancy optimization
