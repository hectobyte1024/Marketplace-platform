import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import initSchema from './database/schema.js';
import router from './routes/index.js';
import { initializeSocket } from './socket.js';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', router);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Initializing database schema...');
    await initSchema();
    
    // Initialize Socket.io
    initializeSocket(server);
    console.log('✓ Socket.io initialized');
    
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
