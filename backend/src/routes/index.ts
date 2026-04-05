import express, { Request, Response } from 'express';
import { query } from '../database/connection.js';
import { WorkspaceService, BookingService, UserService, PricingService, AvailabilityService, AnalyticsService } from '../services/index.js';
import authRoutes, { authMiddleware } from './auth.js';
import { emitToUser, emitToWorkspace, broadcastBookingUpdate } from '../socket.js';

const router = express.Router();
const workspaceService = new WorkspaceService();
const bookingService = new BookingService();
const userService = new UserService();
const pricingService = new PricingService();
const availabilityService = new AvailabilityService();
const analyticsService = new AnalyticsService();

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

// PRICING RULES
router.get('/workspaces/:workspaceId/pricing', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    const rules = await pricingService.getByWorkspace(workspaceId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// POST create pricing rule (host only)
router.post('/workspaces/:workspaceId/pricing', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check ownership
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only manage pricing for your own workspaces' });
    }

    const rule = await pricingService.create({
      workspaceId,
      ...req.body,
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// PATCH update pricing rule (host only)
router.patch('/pricing-rules/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rule = await query('SELECT * FROM pricing_rules WHERE id = $1', [req.params.id]);
    if (rule.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    const pricingRule = rule.rows[0];
    const workspace = await workspaceService.getById(pricingRule.workspace_id);

    // Check ownership
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only modify your own pricing rules' });
    }

    const updated = await pricingService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// DELETE pricing rule (host only)
router.delete('/pricing-rules/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rule = await query('SELECT * FROM pricing_rules WHERE id = $1', [req.params.id]);
    if (rule.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    const pricingRule = rule.rows[0];
    const workspace = await workspaceService.getById(pricingRule.workspace_id);

    // Check ownership
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only delete your own pricing rules' });
    }

    await pricingService.delete(req.params.id);
    res.json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

// POST calculate price for dates
router.post('/workspaces/:workspaceId/calculate-price', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const rules = await pricingService.getByWorkspace(workspaceId);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Calculate price for first day (simplified - could be per-day for more accuracy)
    const dailyRate = pricingService.calculatePrice(workspace.hourly_rate, rules, start) * 24;
    const totalPrice = Math.round(dailyRate * (hours / 24) * 100) / 100;

    res.json({
      baseRate: workspace.hourly_rate,
      totalPrice,
      hours,
      rules,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate price' });
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
    
    // Emit Socket.io events
    // Notify the booking creator
    emitToUser(req.userId!, 'booking-created', {
      booking,
      message: `Your booking for ${workspace.name} is pending host confirmation`,
    });
    
    // Notify the workspace host of new pending booking
    emitToUser(workspace.owner_id, 'new-booking', {
      booking,
      workspace,
      message: `New booking request for ${workspace.name}`,
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
    
    // Emit Socket.io events
    const workspace = await workspaceService.getById(booking.workspace_id);
    
    if (status === 'confirmed') {
      // Notify guest that booking was confirmed
      emitToUser(booking.guest_id, 'booking-confirmed', {
        bookingId,
        message: `Your booking has been confirmed by ${workspace.name}!`,
        booking: updated,
      });
    } else if (status === 'cancelled') {
      // Notify other party of cancellation
      const recipientId = booking.guest_id === req.userId! ? workspace.owner_id : booking.guest_id;
      emitToUser(recipientId, 'booking-cancelled', {
        bookingId,
        message: 'A booking has been cancelled',
        booking: updated,
      });
    }
    
    // Broadcast to workspace for availability updates
    broadcastBookingUpdate(bookingId, booking.workspace_id, {
      status,
      startDate: booking.start_date,
      endDate: booking.end_date,
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Availability Slots
router.get('/workspaces/:workspaceId/availability', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const slots = await availabilityService.getByWorkspace(workspaceId);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability slots' });
  }
});

// Check availability for date range
router.post('/workspaces/:workspaceId/check-availability', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isAvailable = await availabilityService.checkAvailability(
      workspaceId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Create availability slot (host only)
router.post('/workspaces/:workspaceId/availability', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate, isAvailable, recurringPattern, recurringCount } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify workspace ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only manage availability for your own workspaces' });
    }

    const slot = await availabilityService.create({
      workspaceId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isAvailable: isAvailable !== false,
      recurringPattern,
      recurringCount,
      createdBy: req.userId!,
    });

    // Emit Socket.io event for availability update
    emitToWorkspace(workspaceId, 'availability-updated', {
      slot,
      message: isAvailable ? 'Availability slot added' : 'Unavailability period added',
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create availability slot' });
  }
});

// Update availability slot (host only)
router.patch('/availability-slots/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, isAvailable } = req.body;

    // Get slot to check ownership
    const slotResult = await query('SELECT * FROM availability_slots WHERE id = $1', [id]);
    const slot = slotResult.rows[0];

    if (!slot) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Verify workspace ownership
    const workspace = await workspaceService.getById(slot.workspace_id);
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only update your own availability slots' });
    }

    const updated = await availabilityService.update(id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isAvailable,
    });

    // Emit update event
    emitToWorkspace(slot.workspace_id, 'availability-updated', {
      slot: updated,
      message: 'Availability slot updated',
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability slot' });
  }
});

// Delete availability slot (host only)
router.delete('/availability-slots/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get slot to check ownership
    const slotResult = await query('SELECT * FROM availability_slots WHERE id = $1', [id]);
    const slot = slotResult.rows[0];

    if (!slot) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Verify workspace ownership
    const workspace = await workspaceService.getById(slot.workspace_id);
    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only delete your own availability slots' });
    }

    await availabilityService.delete(id);

    // Emit update event
    emitToWorkspace(slot.workspace_id, 'availability-updated', {
      slot: null,
      message: 'Availability slot removed',
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete availability slot' });
  }
});

// Analytics - Host Dashboard
router.get('/workspaces/:workspaceId/analytics/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { days } = req.query;

    // Verify workspace ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only view analytics for your own workspaces' });
    }

    const summary = await analyticsService.getSummary(workspaceId, parseInt(days as string) || 30);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

router.get('/workspaces/:workspaceId/analytics/trends', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { days } = req.query;

    // Verify workspace ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only view analytics for your own workspaces' });
    }

    const trends = await analyticsService.getTrends(workspaceId, parseInt(days as string) || 30);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics trends' });
  }
});

router.get('/workspaces/:workspaceId/analytics/monthly', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { months } = req.query;

    // Verify workspace ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only view analytics for your own workspaces' });
    }

    const monthly = await analyticsService.getMonthlyRevenue(workspaceId, parseInt(months as string) || 6);
    res.json(monthly);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
});

router.get('/workspaces/:workspaceId/analytics/top-hours', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { days } = req.query;

    // Verify workspace ownership
    const workspace = await workspaceService.getById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id !== req.userId!) {
      return res.status(403).json({ error: 'You can only view analytics for your own workspaces' });
    }

    const topHours = await analyticsService.getTopHours(workspaceId, parseInt(days as string) || 30);
    res.json(topHours);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top hours' });
  }
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
