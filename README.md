# VoiceTravel AI - AI-Powered Multilingual Voice Travel Assistant

A production-ready full-stack web and mobile application that helps elderly and non-tech-savvy users book train, bus, and flight tickets using voice commands in Indian languages.

## 🎯 Objective

Create an AI-powered multilingual voice assistant that understands natural language voice commands in Indian languages and helps users complete travel bookings with minimal typing.

**Example Commands:**
- "Book a train ticket from Mumbai to Chennai tomorrow"
- "Check my PNR status"
- "Find the cheapest flight to Delhi next week"

## 🏗️ Architecture Overview

```
VoiceTravel-AI/
├── backend/                 # Node.js + Express.js API Server
├── frontend/                # Next.js 15 Web Application
├── mobile/                  # React Native + Expo Mobile App
├── database/                # PostgreSQL + Prisma ORM
├── docker/                  # Docker Configuration
├── docs/                    # Documentation & API Specs
└── .github/                 # GitHub Actions CI/CD
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library
- **Zustand** - State management

### Mobile
- **React Native** - Cross-platform mobile
- **Expo** - Development & deployment
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **JWT** - Authentication

### Database
- **PostgreSQL** - Relational database
- **Prisma** - ORM & migrations

### AI/ML
- **OpenAI Whisper** - Speech-to-Text
- **GPT-3.5/GPT-4** - Intent extraction & conversation
- **Google Text-to-Speech** - TTS support

### Deployment
- **Docker** - Containerization
- **AWS** - Cloud infrastructure
- **GitHub Actions** - CI/CD pipeline

## ✨ Core Features

### 1. User Authentication
- Mobile number login with OTP
- JWT token-based authentication
- Secure session management
- Profile management

### 2. Voice Assistant
- Record voice input
- Real-time speech-to-text conversion
- Automatic language detection (English, Hindi, Tamil, Telugu, Marathi, Kannada, Malayalam)
- Context-aware conversations

### 3. Intent Detection
- Train booking
- Flight booking
- Bus booking
- PNR status inquiry
- Ticket cancellation
- Refund inquiry

### 4. Booking Modules
- **Train Booking**: Search, seat availability, fare calculation
- **Flight Booking**: Search, price comparison, booking
- **Bus Booking**: Search, seat selection, booking

### 5. Payment Integration
- UPI payment
- Credit card
- Debit card
- Secure payment gateway
- Transaction history

### 6. Admin Dashboard
- User management
- Booking statistics
- Revenue analytics
- Language usage analytics
- Voice query logs

### 7. Accessibility Features
- Large buttons & high contrast
- Large fonts
- Voice-first interaction
- Minimal typing required
- Simple navigation

## 📦 Database Schema

Complete schema is in [DATABASE.md](./docs/DATABASE.md)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose
- AWS Account (for production deployment)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/aparna02008/VoiceTravel-AI.git
cd VoiceTravel-AI
```

#### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

#### 4. Setup Mobile
```bash
cd ../mobile
npm install
cp .env.example .env.local
npx expo start
```

### Environment Variables

Create `.env` files in respective directories. See `.env.example` files for templates.

## 📚 API Documentation

See [API.md](./docs/API.md) for complete API documentation.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

Target: **80%+ coverage**

## 🐳 Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Stop services
docker-compose down
```

## 🚢 Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for AWS deployment guide.

## 📁 Project Structure

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed project structure.

## 🔒 Security

See [SECURITY.md](./docs/SECURITY.md) for security details.

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Large buttons (minimum 48x48px)
- High contrast (4.5:1 ratio)
- Large fonts (16px+ minimum)
- Voice-first interaction

## 📱 Supported Languages

- English
- Hindi
- Tamil
- Telugu
- Marathi
- Kannada
- Malayalam

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support, open an issue on GitHub.

---

**Status**: Development Phase 🔧
