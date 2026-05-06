# CaloCola Backend (NestJS + Node.js)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   ```

3. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Push schema to database (Supabase)
   npm run prisma:push

   # Optional: Open Prisma Studio
   npm run prisma:studio
   ```

4. **Run the application:**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users
- `GET /users/profile` - Get user profile (protected)
- `PUT /users/profile` - Update user profile (protected)

### Foods
- `GET /foods` - Get all foods or search
- `GET /foods/:id` - Get food by ID

### Daily Tracking
- `POST /daily-tracking/intake` - Add food intake (protected)
- `GET /daily-tracking/totals?date=2026-05-06` - Get daily totals (protected)
- `GET /daily-tracking/intakes?date=2026-05-06` - Get daily intakes (protected)

## Database Schema

- **User**: Authentication and basic info
- **UserProfile**: Health metrics and targets
- **Food**: Master food data (references foods.json)
- **DailyIntake**: Individual food log entries
- **DailyTotal**: Aggregated daily summaries

## Features

- JWT Authentication
- Prisma ORM with PostgreSQL
- Daily food intake tracking
- Real-time total calculations
- Radar chart data endpoints