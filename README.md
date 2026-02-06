# Frysta - AI-Powered Mentor Platform

A modern learning management system built with Next.js and Supabase, featuring personalized mentor matching, curriculum recommendations, and separate onboarding flows for students and mentors.

## ✨ Features

- **Role-Based Onboarding** - Separate flows for students and mentors
- **Mentor Matching** - Automatic assignment based on skill domain and experience
- **Personalized Curriculum** - AI-driven recommendations based on learning goals
- **Intent Classification** - Smart categorization of learning objectives
- **Real-time Dashboard** - Progress tracking and mentor interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/saugatkarki1/unseen-app-design.git
cd unseen-app-design

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these values from your Supabase project: **Dashboard → Settings → API**

See `docs/README_ENV.md` for detailed environment setup instructions.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated routes
│   │   ├── dashboard/      # Student dashboard
│   │   ├── mentor-dashboard/
│   │   ├── mentor-onboarding/
│   │   └── profile/
│   ├── auth/               # Authentication
│   └── onboarding/         # Student onboarding flow
├── components/             # React components
├── lib/                    # Core utilities
│   ├── auth/               # Onboarding gate logic
│   ├── supabase/           # Database clients
│   └── *.ts                # Classifiers, utilities
└── docs/                   # Documentation
```

## 🔐 Authentication Flow

1. User signs up → email confirmation sent
2. User confirms email → session established
3. Onboarding gate checks profile → routes to appropriate flow
4. Students: 7-step onboarding → dashboard
5. Mentors: Role selection → mentor onboarding → mentor dashboard

## 🗄️ Database Setup

Run the schema migrations in Supabase SQL Editor. See `docs/SCHEMA_REFERENCE.md` for the complete database schema.

Key tables:
- `profiles` - User profiles with role and onboarding data
- `mentors` - Mentor profiles and specializations
- `user_mentor` - Student-mentor assignments
- `curriculum_items` - Learning content
- `user_curriculum` - Personalized assignments

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📖 Additional Documentation

- `docs/SCHEMA_REFERENCE.md` - Database schema reference
- `docs/README_ENV.md` - Environment setup guide

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## License

MIT
