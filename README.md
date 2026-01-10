# TradeCraft MVP - AI-Powered Peer-to-Peer Technical Skill Exchange

## 🎯 Project Overview

TradeCraft is an AI-assisted platform that enables users to exchange technical skills through peer-to-peer bartering. Users teach skills they know in exchange for learning skills from others—no money involved.

### Key Features
- **AI-Powered Matching**: Hybrid algorithm combining semantic embeddings, reciprocity scoring, and availability overlap
- **Explainable AI**: Every match includes a human-readable explanation of why it works
- **Smart Session Planning**: AI-generated session agendas tailored to skill levels
- **In-App AI Assistant**: Technical help, code snippets, and learning guidance
- **Dark Mode**: Full dark mode support throughout the application

---

## 🏗️ Architecture

### Tech Stack

**Backend (Python)**
- FastAPI for REST API
- Supabase (PostgreSQL + pgvector) for database
- sentence-transformers (all-MiniLM-L6-v2) for embeddings
- OpenAI GPT-4 for explanations and AI assistant
- Comprehensive security and validation

**Frontend (Next.js)**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS with custom design system
- Supabase Auth for authentication
- React hooks for state management

**Database**
- PostgreSQL with pgvector extension
- Row-level security (RLS) policies
- Optimized indexes for vector similarity search
- Proper constraints and validations

---

## 📁 Project Structure

```
tradecraft/
├── database/
│   └── schema.sql                 # Complete database schema with pgvector
│
├── backend/                       # Python FastAPI backend
│   ├── app/
│   │   ├── routes/               # API endpoints
│   │   │   ├── users.py
│   │   │   ├── skills.py
│   │   │   ├── matches.py
│   │   │   ├── sessions.py
│   │   │   ├── messages.py
│   │   │   └── assistant.py
│   │   ├── services/             # Business logic
│   │   │   ├── embeddings.py    # Embedding generation
│   │   │   ├── matching.py      # Matching algorithm
│   │   │   └── ai_assistant.py  # GPT-4 integration
│   │   ├── config.py             # Configuration
│   │   ├── database.py           # Supabase client
│   │   ├── models.py             # Pydantic models
│   │   ├── auth.py               # Authentication
│   │   └── utils.py              # Utilities
│   ├── main.py                   # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                      # Next.js frontend
    ├── app/
    │   ├── page.tsx              # Landing page
    │   ├── auth/                 # Authentication
    │   ├── onboarding/           # Skill setup
    │   ├── dashboard/            # Main app
    │   ├── match/[id]/           # Match details
    │   └── globals.css
    ├── components/
    │   ├── ui/                   # Reusable components
    │   └── layout/               # Layout components
    ├── lib/
    │   ├── supabase.ts           # Supabase client
    │   └── api.ts                # API client
    ├── package.json
    ├── tailwind.config.js
    └── .env.example
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Git

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire `database/schema.sql` file
3. Enable the pgvector extension (should be enabled automatically)
4. Copy your project URL and anon key

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\\Scripts\\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add your credentials:
# - SUPABASE_URL
# - SUPABASE_KEY
# - SUPABASE_SERVICE_KEY
# - OPENAI_API_KEY
# - SECRET_KEY (generate with: openssl rand -hex 32)

# Run the server
python main.py
```

Backend will run on `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and add:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🧪 Testing the MVP

### 1. Create Test Users

Use the onboarding flow to create 2-3 users with complementary skills:

**User 1:**
- Teaches: React (Level 5)
- Wants to learn: Python (Level 2)

**User 2:**
- Teaches: Python (Level 4)
- Wants to learn: React (Level 3)

### 2. Test Matching

1. Log in as User 1
2. Navigate to Dashboard
3. Click "Discover Matches"
4. Verify User 2 appears with:
   - High match score
   - AI-generated explanation
   - Skill exchange summary

### 3. Test Session Creation

1. Click "Request Exchange" on a match
2. Navigate to match page
3. Click "Generate Session Agenda"
4. Verify AI creates a structured agenda
5. Schedule session and export calendar invite

### 4. Test AI Assistant

1. Open AI Assistant panel on dashboard
2. Ask: "How do I debug a React useEffect infinite loop?"
3. Verify response is concise and includes disclaimer
4. Request code snippet (should be ≤20 lines)

---

## 🔒 Security Features

✅ Row-level security (RLS) on all tables
✅ Input validation with Pydantic
✅ SQL injection prevention
✅ XSS protection with HTML sanitization
✅ CSRF protection
✅ JWT token authentication
✅ API rate limiting
✅ Content moderation for AI responses
✅ Environment variables for secrets
✅ CORS configuration

---

## 🎨 Design System

### Colors
- **Primary Blue**: `#2563EB` (from inspiration image)
- **Accent Green**: `#10B981` (from inspiration image)
- **Dark Mode**: Slate-based palette

### Typography
- Font: Inter (Google Fonts)
- Hierarchical sizing
- Proper contrast ratios

### Components
- Glassmorphism effects
- Smooth animations
- Hover states
- Dark mode support

---

## 📊 Matching Algorithm

### Hybrid Scoring (Weights)
1. **Semantic Similarity** (50%): Cosine similarity between skill embeddings
2. **Reciprocity Balance** (25%): Skill level compatibility
3. **Availability Overlap** (15%): Common time slots
4. **Preference Alignment** (10%): Language, learning style

### Explainability
Every match includes an AI-generated explanation:
- Why skills complement each other
- Why levels are compatible
- Schedule alignment details

---

## 🤖 AI Features

### Embeddings
- Model: all-MiniLM-L6-v2 (384 dimensions)
- Canonical text generation from skills
- Normalized vectors for cosine similarity

### Match Explanations
- GPT-4 powered
- 2-3 sentence summaries
- Human-readable and encouraging

### Session Agendas
- Tailored to skill level and duration
- Structured with time allocations
- Practical and actionable

### AI Assistant
- Technical Q&A
- Code snippets (max 20 lines)
- Debugging hints
- Learning strategies
- Content moderation

---

## 📝 API Endpoints

### Users
- `GET /api/users/me` - Get current user
- `POST /api/users` - Create user
- `PATCH /api/users/me` - Update profile

### Skills
- `GET /api/skills` - Get user skills
- `POST /api/skills` - Add skill (generates embedding)
- `PATCH /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill

### Matches
- `GET /api/matches/discover` - Find matches (AI-powered)
- `POST /api/matches` - Request exchange
- `GET /api/matches/{id}` - Get match details
- `PATCH /api/matches/{id}` - Update status

### Sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/generate-agenda` - AI agenda generation
- `GET /api/sessions/match/{id}` - Get match sessions

### Messages
- `GET /api/messages/match/{id}` - Get messages
- `POST /api/messages` - Send message

### AI Assistant
- `POST /api/assistant/chat` - Chat with AI

---

## 🐛 Troubleshooting

### Backend Issues

**Import errors:**
```bash
pip install --upgrade -r requirements.txt
```

**Database connection failed:**
- Verify Supabase URL and keys in `.env`
- Check if pgvector extension is enabled

**Embedding model download slow:**
- First run downloads ~80MB model
- Subsequent runs use cached model

### Frontend Issues

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase auth not working:**
- Verify environment variables in `.env.local`
- Check Supabase project settings

---

## 🎯 Success Criteria

✅ Onboarding completes in <2 minutes
✅ Match generated within 5 seconds
✅ Match explanations are understandable
✅ Session agenda and calendar export work
✅ Codebase is clean and well-documented
✅ Dark mode works across all pages
✅ No API keys exposed in client code

---

## 📚 Next Steps (Post-MVP)

- Real-time messaging with WebSockets
- Video call integration
- Skill verification system
- User reviews and ratings
- Advanced availability scheduling
- Mobile app (React Native)
- Analytics dashboard
- Email notifications

---

## 👥 Team

Built for hackathon MVP demonstration.

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embeddings API
- Supabase for database and auth
- Sentence Transformers for embedding models
- Next.js and FastAPI communities

---

**Happy Skill Exchanging! 🚀**
