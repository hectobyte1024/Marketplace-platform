import express, { Request, Response } from 'express';
import { query } from '../database/connection.js';
import { WorkspaceService, BookingService, UserService } from '../services/index.js';
import authRoutes, { authMiddleware } from './auth.js';

const router = express.Router();
const workspaceService = new WorkspaceService();
const bookingService = new BookingService();
const userService = new UserService();

// Mount auth routes
router.use('/auth', authRoutes);

// Workspaces
router.get('/workspaces', async (req: Request, res: Response) => {
  try {
    const workspaces = await workspaceService.getAll();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

router.get('/workspaces/:id', async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.getById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

router.get('/workspaces/search/location', async (req: Request, res: Response) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location parameter required' });
    }
    const workspaces = await workspaceService.getByLocation(location as string);
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/workspaces', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.create({
      ...req.body,
      ownerId: req.userId!,
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// GET my workspaces (for host dashboard)
router.get('/my-workspaces', authMiddleware, async (req: Request, res: Response) => {
  try {
    const allWorkspaces = await workspaceService.getAll();
    const userWorkspaces = allWorkspaces.filter((ws: any) => ws.owner_id === req.userId!);
    res.json(userWorkspaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your workspaces' });
  }
});

// PATCH update workspace (owner only)
router.patch('/workspaces/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.id;
    
    // Check ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only edit your own workspaces' });
    }

    const updated = await workspaceService.update(workspaceId, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// DELETE workspace (owner only)
router.delete('/workspaces/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workspaceId = req.params.id;
    
    // Check ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only delete your own workspaces' });
    }

    await workspaceService.delete(workspaceId);
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

// Bookings
router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// GET my bookings (for guests)
router.get('/my-bookings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getByGuest(req.userId!);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your bookings' });
  }
});

// GET bookings for a workspace (for host)
router.get('/workspaces/:workspaceId/bookings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    
    // Check ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only view bookings for your own workspaces' });
    }
    
    const bookings = await bookingService.getByWorkspace(workspaceId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST create booking with availability checking
router.post('/bookings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId, startDate, endDate } = req.body;
    
    if (!workspaceId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify workspace exists
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    // Check for availability conflicts
    const result = await query(
      `SELECT COUNT(*) as conflicts FROM bookings 
       WHERE workspace_id = $1 
       AND status IN ('confirmed', 'pending')
       AND (start_date, end_date) OVERLAPS ($2::timestamp, $3::timestamp)`,
      [workspaceId, startDate, endDate]
    );
    
    if (result.rows[0] && parseInt(result.rows[0].conflicts) > 0) {
      return res.status(409).json({ error: 'Workspace not available for selected dates' });
    }
    
    // Calculate total price
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    const totalPrice = hours * workspace.hourly_rate;
    
    const booking = await bookingService.create({
      workspaceId,
      guestId: req.userId!,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice,
      status: 'pending',
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH update booking status (host can confirm, guest/system can cancel)
router.patch('/bookings/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Verify booking exists
    const booking = await bookingService.getById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify authorization
    if (status === 'cancelled' && booking.guest_id !== req.userId!) {
      return res.status(403).json({ error: 'Only the guest can cancel their booking' });
    }
    
    if (status === 'confirmed') {
      // Check if user is the workspace owner
      const workspace = await workspaceService.getById(booking.workspace_id);
      if (workspace.owner_id !== req.userId!) {
        return res.status(403).json({ error: 'Only the host can confirm bookings' });
      }
    }
    
    const updated = await bookingService.updateStatus(bookingId, status);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
