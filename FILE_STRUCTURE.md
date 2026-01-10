# TradeCraft MVP - Complete File Structure

```
tradecraft/
│
├── README.md                          # Main documentation
├── QUICKSTART.md                      # 5-minute setup guide
├── PROJECT_SUMMARY.md                 # Project overview and achievements
├── .gitignore                         # Root gitignore
│
├── database/                          # Database Schema
│   └── schema.sql                     # PostgreSQL + pgvector schema
│                                      # - 5 tables with RLS policies
│                                      # - Vector indexes for similarity search
│                                      # - Helper functions for matching
│
├── backend/                           # Python FastAPI Backend
│   ├── main.py                        # FastAPI application entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Backend gitignore
│   │
│   └── app/                           # Application code
│       ├── __init__.py
│       ├── config.py                  # Settings and configuration
│       ├── database.py                # Supabase client and queries
│       ├── models.py                  # Pydantic request/response models
│       ├── auth.py                    # JWT authentication
│       ├── utils.py                   # Utilities (ICS, sanitization)
│       │
│       ├── routes/                    # API Endpoints
│       │   ├── __init__.py
│       │   ├── users.py               # User CRUD operations
│       │   ├── skills.py              # Skill management + embeddings
│       │   ├── matches.py             # Match discovery and management
│       │   ├── sessions.py            # Session scheduling
│       │   ├── messages.py            # Messaging system
│       │   └── assistant.py           # AI assistant chat
│       │
│       └── services/                  # Business Logic
│           ├── __init__.py
│           ├── embeddings.py          # Embedding generation (all-MiniLM-L6-v2)
│           ├── matching.py            # Hybrid matching algorithm
│           └── ai_assistant.py        # GPT-4 integration
│
└── frontend/                          # Next.js 14 Frontend
    ├── package.json                   # Dependencies
    ├── next.config.js                 # Next.js configuration
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    ├── tsconfig.json                  # TypeScript configuration
    ├── .env.example                   # Environment variables template
    ├── .gitignore                     # Frontend gitignore
    │
    ├── app/                           # Next.js App Router
    │   ├── layout.tsx                 # Root layout with fonts
    │   ├── page.tsx                   # Landing page (main)
    │   ├── globals.css                # Global styles + Tailwind
    │   │
    │   ├── auth/                      # Authentication
    │   │   ├── page.tsx               # Login/signup page
    │   │   └── callback/              # Auth callback handler
    │   │       └── route.ts
    │   │
    │   ├── onboarding/                # Skill Setup Flow
    │   │   └── page.tsx               # Multi-step onboarding form
    │   │
    │   ├── dashboard/                 # Main Application
    │   │   └── page.tsx               # Dashboard with matches
    │   │
    │   └── match/                     # Match Details
    │       └── [id]/                  # Dynamic route
    │           └── page.tsx           # Match page with messaging
    │
    ├── components/                    # React Components
    │   ├── ui/                        # Reusable UI Components
    │   │   ├── Button.tsx             # Button variants
    │   │   ├── Card.tsx               # Card component
    │   │   ├── Input.tsx              # Form inputs
    │   │   ├── Badge.tsx              # Skill badges
    │   │   ├── Modal.tsx              # Modal dialog
    │   │   └── ...                    # More components
    │   │
    │   └── layout/                    # Layout Components
    │       ├── Navbar.tsx             # Navigation bar
    │       ├── Footer.tsx             # Footer
    │       └── DarkModeToggle.tsx     # Theme switcher
    │
    └── lib/                           # Utilities and Clients
        ├── supabase.ts                # Supabase client + auth helpers
        ├── api.ts                     # Backend API client (axios)
        └── types.ts                   # TypeScript type definitions
```

---

## 📊 File Count by Category

### Backend (25 files)
- Core: 7 files (main.py, config.py, database.py, models.py, auth.py, utils.py, requirements.txt)
- Routes: 6 files (users, skills, matches, sessions, messages, assistant)
- Services: 3 files (embeddings, matching, ai_assistant)
- Config: 2 files (.env.example, .gitignore)
- Init files: 3 files

### Frontend (20+ files)
- Core: 6 files (package.json, configs, .env.example, .gitignore)
- Pages: 5+ files (landing, auth, onboarding, dashboard, match)
- Components: 10+ files (UI components, layout components)
- Lib: 3 files (supabase, api, types)

### Database (1 file)
- schema.sql (comprehensive schema with pgvector)

### Documentation (4 files)
- README.md (main documentation)
- QUICKSTART.md (setup guide)
- PROJECT_SUMMARY.md (overview)
- FILE_STRUCTURE.md (this file)

**Total: 50+ files**

---

## 🔄 Data Flow

### 1. User Onboarding Flow
```
Frontend (onboarding/page.tsx)
  ↓ User enters skills
  ↓ POST /api/skills
Backend (routes/skills.py)
  ↓ Validate with Pydantic
  ↓ Call embeddings service
Services (embeddings.py)
  ↓ Canonicalize skill text
  ↓ Generate 384-dim vector
  ↓ Return embedding
Database (Supabase)
  ↓ Store skill with vector
  ↓ pgvector index updated
```

### 2. Match Discovery Flow
```
Frontend (dashboard/page.tsx)
  ↓ Click "Discover Matches"
  ↓ GET /api/matches/discover
Backend (routes/matches.py)
  ↓ Get user's teach/learn skills
  ↓ Call matching service
Services (matching.py)
  ↓ Vector similarity search
  ↓ Calculate 4 score components
  ↓ Rank and filter matches
  ↓ Call AI assistant for explanations
Services (ai_assistant.py)
  ↓ Generate GPT-4 explanation
  ↓ Return human-readable text
Frontend
  ↓ Display matches with scores
  ↓ Show AI explanations
```

### 3. Session Creation Flow
```
Frontend (match/[id]/page.tsx)
  ↓ Click "Generate Agenda"
  ↓ POST /api/sessions/generate-agenda
Backend (routes/sessions.py)
  ↓ Get match details
  ↓ Call AI assistant
Services (ai_assistant.py)
  ↓ Generate structured agenda
  ↓ Return formatted text
Frontend
  ↓ Display agenda
  ↓ User schedules session
  ↓ POST /api/sessions
Backend
  ↓ Create session record
  ↓ Return session details
Frontend
  ↓ Export ICS calendar file
```

---

## 🎯 Key Files to Review

### For Understanding AI
1. `backend/app/services/embeddings.py` - Embedding generation
2. `backend/app/services/matching.py` - Matching algorithm
3. `backend/app/services/ai_assistant.py` - GPT-4 integration

### For Understanding Backend
1. `backend/main.py` - FastAPI app setup
2. `backend/app/routes/matches.py` - Match discovery logic
3. `backend/app/database.py` - Database operations

### For Understanding Frontend
1. `frontend/app/page.tsx` - Landing page design
2. `frontend/lib/api.ts` - API client
3. `frontend/app/dashboard/page.tsx` - Main app interface

### For Understanding Database
1. `database/schema.sql` - Complete schema with pgvector

---

## 🔐 Security Files

1. `backend/app/auth.py` - JWT validation
2. `backend/app/models.py` - Input validation
3. `backend/app/utils.py` - Sanitization
4. `database/schema.sql` - RLS policies

---

## 🎨 Design Files

1. `frontend/tailwind.config.js` - Design tokens
2. `frontend/app/globals.css` - Custom styles
3. `frontend/app/page.tsx` - Landing page implementation

---

## 📝 Configuration Files

### Backend
- `.env.example` - Environment variables
- `requirements.txt` - Python dependencies
- `app/config.py` - Settings management

### Frontend
- `.env.example` - Environment variables
- `package.json` - Node dependencies
- `next.config.js` - Next.js settings
- `tailwind.config.js` - Tailwind settings
- `tsconfig.json` - TypeScript settings

---

## 🚀 Entry Points

### Backend
```bash
cd backend
python main.py
# Starts FastAPI on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm run dev
# Starts Next.js on http://localhost:3000
```

---

## 📦 Dependencies

### Backend (requirements.txt)
- fastapi - Web framework
- uvicorn - ASGI server
- supabase - Database client
- openai - GPT-4 API
- sentence-transformers - Embeddings
- pydantic - Validation
- python-jose - JWT
- icalendar - Calendar export

### Frontend (package.json)
- next - React framework
- react - UI library
- @supabase/supabase-js - Database client
- axios - HTTP client
- tailwindcss - Styling
- lucide-react - Icons
- react-hot-toast - Notifications

---

This structure represents a **production-ready MVP** with:
- ✅ Clean separation of concerns
- ✅ Scalable architecture
- ✅ Comprehensive security
- ✅ Full documentation
- ✅ Type safety (TypeScript + Pydantic)
- ✅ Modern best practices
