import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to phone number
 * @body    { phoneNumber: string }
 * @returns { success: boolean, message: string }
 */
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number format (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid Indian phone number' });
    }

    // TODO: Integrate with Twilio to send OTP
    // For now, we'll generate a mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = Buffer.from(otp).toString('base64');
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update or create user with OTP
    await prisma.user.upsert({
      where: { phoneNumber },
      update: { otpHash, otpExpiry },
      create: { phoneNumber, otpHash, otpExpiry }
    });

    // In production, send OTP via Twilio
    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production
      devOtp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and get JWT token
 * @body    { phoneNumber: string, otp: string }
 * @returns { token: string, user: object }
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP required' });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({ error: 'OTP not sent or expired' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const storedOtp = Buffer.from(user.otpHash, 'base64').toString();
    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP
    await prisma.user.update({
      where: { phoneNumber },
      data: { otpHash: null, otpExpiry: null }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @auth    Required (JWT)
 * @returns { user: object }
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @auth    Required (JWT)
 * @body    { name?: string, email?: string, preferredLanguage?: string }
 * @returns { user: object }
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { name, email, preferredLanguage } = req.body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(preferredLanguage && { preferredLanguage })
      }
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
