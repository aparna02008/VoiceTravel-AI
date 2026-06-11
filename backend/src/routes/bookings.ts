import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Mock booking data for demo
 */
const mockTrains = [
  { id: 1, name: 'Rajdhani Express', departure: '09:00', arrival: '20:00', price: 850, class: '3AC', seats: 45 },
  { id: 2, name: 'Shatabdi Express', departure: '10:00', arrival: '18:00', price: 1200, class: '2AC', seats: 30 },
  { id: 3, name: 'Local Express', departure: '14:00', arrival: '23:00', price: 450, class: 'General', seats: 100 }
];

const mockFlights = [
  { id: 1, name: 'Air India', departure: '08:00', arrival: '11:30', price: 3500, airline: 'AI', seats: 50 },
  { id: 2, name: 'IndiGo', departure: '09:00', arrival: '12:15', price: 3200, airline: '6E', seats: 60 },
  { id: 3, name: 'SpiceJet', departure: '14:00', arrival: '17:30', price: 2800, airline: 'SG', seats: 75 }
];

/**
 * @route   POST /api/v1/bookings/search
 * @desc    Search trains, flights, or buses
 * @auth    Required (JWT)
 * @body    { bookingType: string, from: string, to: string, date: string, passengers: number }
 * @returns { results: array }
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { bookingType, from, to, date, passengers = 1 } = req.body;

    if (!bookingType || !from || !to || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let results;

    switch (bookingType) {
      case 'train':
        results = mockTrains.map(train => ({
          ...train,
          from,
          to,
          date,
          totalPrice: train.price * passengers
        }));
        break;
      case 'flight':
        results = mockFlights.map(flight => ({
          ...flight,
          from,
          to,
          date,
          totalPrice: flight.price * passengers
        }));
        break;
      case 'bus':
        results = [
          { id: 1, name: 'RedBus', departure: '08:00', arrival: '14:00', price: 350, seats: 40 },
          { id: 2, name: 'Volvo Bus', departure: '10:00', arrival: '16:00', price: 450, seats: 30 }
        ].map(bus => ({
          ...bus,
          from,
          to,
          date,
          totalPrice: bus.price * passengers
        }));
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }

    // Save search to database
    const userId = (req as any).userId;
    await prisma.travelSearch.create({
      data: {
        userId,
        searchType: bookingType,
        fromLocation: from,
        toLocation: to,
        travelDate: new Date(date),
        passengers,
        resultsCount: results.length
      }
    });

    res.status(200).json({
      success: true,
      bookingType,
      from,
      to,
      date,
      passengers,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search bookings' });
  }
});

/**
 * @route   POST /api/v1/bookings/create
 * @desc    Create a new booking
 * @auth    Required (JWT)
 * @body    { bookingType, from, to, date, passengers, selectedOption }
 * @returns { booking: object }
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bookingType, from, to, date, passengers, selectedOption } = req.body;

    if (!bookingType || !from || !to || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        bookingType,
        status: 'pending',
        fromLocation: from,
        toLocation: to,
        travelDate: new Date(date),
        passengers,
        bookingDetails: selectedOption || {},
        totalPrice: selectedOption?.totalPrice || 0,
        currency: 'INR'
      }
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        bookingType: booking.bookingType,
        status: booking.status,
        totalPrice: booking.totalPrice,
        currency: booking.currency
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * @route   GET /api/v1/bookings
 * @desc    Get user bookings
 * @auth    Required (JWT)
 * @returns { bookings: array }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const bookings = await prisma.booking.findMany({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking details
 * @auth    Required (JWT)
 * @returns { booking: object }
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

/**
 * @route   POST /api/v1/bookings/:id/cancel
 * @desc    Cancel booking
 * @auth    Required (JWT)
 * @returns { booking: object }
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
