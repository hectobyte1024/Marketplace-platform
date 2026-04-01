#!/bin/bash
# Test API endpoints - run this script to verify the backend is working

echo "🧪 Testing Marketplace API..."
echo ""

# Test health check
echo "1️⃣  Health Check"
curl -s http://localhost:3000/api/health | jq . || echo "❌ Failed to connect to backend"
echo ""

# Test list workspaces
echo "2️⃣  List Workspaces"
curl -s http://localhost:3000/api/workspaces | jq . || echo "❌ Database not connected"
echo ""

# Test create workspace (example)
echo "3️⃣  Create Sample Workspace"
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Modern Downtown Office",
    "description": "Spacious open office with natural light and great views",
    "location": "New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "capacity": 20,
    "hourlyRate": 45,
    "amenities": ["WiFi", "Parking", "Coffee Bar", "Meeting Rooms"],
    "images": ["https://example.com/office1.jpg"],
    "ownerId": "host-001"
  }' 2>/dev/null | jq . || echo "❌ Failed to create workspace"
echo ""

echo "✅ API testing complete!"
echo ""
echo "📍 URLs:"
echo "   Backend: http://localhost:3000/api"
echo "   Frontend: http://localhost:3001"
