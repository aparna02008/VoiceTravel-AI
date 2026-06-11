import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import OpenAI from 'openai';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * @route   POST /api/v1/voice/transcribe
 * @desc    Transcribe voice to text using Whisper
 * @auth    Required (JWT)
 * @body    FormData with audio file and language
 * @returns { text: string, language: string, confidence: number }
 */
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    const { language = 'en' } = req.body;

    // Convert buffer to file-like object for OpenAI
    const file = new File([req.file.buffer], req.file.originalname || 'audio.wav', {
      type: req.file.mimetype
    });

    // Transcribe using Whisper
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: language
    });

    res.status(200).json({
      success: true,
      text: transcript.text,
      language,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

/**
 * @route   POST /api/v1/voice/detect-intent
 * @desc    Detect user intent from text
 * @auth    Required (JWT)
 * @body    { text: string, language?: string, context?: object }
 * @returns { intent: string, entities: object, confidence: number }
 */
router.post('/detect-intent', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en', context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Analyze the following user message and detect their intent for a travel booking assistant.

User Message: "${text}"
Language: ${language}

Respond with JSON in this format:
{
  "intent": "booking|pnr_inquiry|cancellation|refund_inquiry|search|other",
  "subIntent": "train|flight|bus|general",
  "entities": {
    "from": "location or null",
    "to": "location or null",
    "date": "date or null",
    "passengers": "number or null",
    "class": "travel class or null"
  },
  "confidence": 0-1,
  "requiresFollowUp": true|false
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Intent detection error:', error);
    res.status(500).json({ error: 'Failed to detect intent' });
  }
});

/**
 * @route   POST /api/v1/voice/start-conversation
 * @desc    Start a new voice conversation
 * @auth    Required (JWT)
 * @body    { language: string, intent: string }
 * @returns { conversationId: string }
 */
router.post('/start-conversation', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware
    const { language = 'en', intent = 'booking' } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        language,
        intent,
        status: 'active'
      }
    });

    res.status(200).json({
      success: true,
      conversationId: conversation.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

/**
 * @route   POST /api/v1/voice/send-message
 * @desc    Send and process message in conversation
 * @auth    Required (JWT)
 * @body    { conversationId: string, message: string, isVoice?: boolean }
 * @returns { response: string, intent: string }
 */
router.post('/send-message', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { conversationId, message, isVoice = false } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Conversation ID and message required' });
    }

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: message
      }
    });

    // Generate AI response
    const prompt = `You are a helpful voice-based travel booking assistant for elderly users in India. Keep responses concise and clear.

User: ${message}

Respond naturally and helpfully, asking clarifying questions if needed.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Save assistant response
    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: assistantMessage
      }
    });

    res.status(200).json({
      success: true,
      response: assistantMessage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
