# TradeCraft MVP - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to initialize (~2 minutes)
4. Go to **SQL Editor** in the left sidebar
5. Click **New Query**
6. Copy and paste the entire contents of `database/schema.sql`
7. Click **Run** to execute the schema
8. Go to **Project Settings** > **API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

### Step 2: Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Edit .env and add your keys:
# - SUPABASE_URL=<from step 1>
# - SUPABASE_KEY=<anon key from step 1>
# - SUPABASE_SERVICE_KEY=<service_role key from step 1>
# - OPENAI_API_KEY=<your OpenAI key>
# - SECRET_KEY=<generate with: openssl rand -hex 32>

# Run the backend
python main.py
```

Backend will start on http://localhost:8000
API docs: http://localhost:8000/docs

### Step 3: Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # Mac/Linux

# Edit .env.local and add:
# - NEXT_PUBLIC_SUPABASE_URL=<from step 1>
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from step 1>
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the frontend
npm run dev
```

Frontend will start on http://localhost:3000

### Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Get Started" to go to authentication
3. Enter your email and click "Send magic link"
4. Check your email and click the link
5. Complete the onboarding flow:
   - Add your name and bio
   - Add skills you can teach (e.g., "React", level 5)
   - Add skills you want to learn (e.g., "Python", level 2)
   - Add availability (select days and times)
6. Click "Complete Profile"
7. You'll be redirected to the dashboard
8. Click "Discover Matches" to see AI-powered matches

### Step 5: Create a Second User (for testing matches)

1. Open an incognito/private browser window
2. Go to http://localhost:3000
3. Sign up with a different email
4. Add complementary skills:
   - Teach: Python (level 4)
   - Learn: React (level 3)
5. Go back to the first user's dashboard
6. Refresh to see the new match appear!

---

## 🎯 What You've Built

### Backend Features ✅
- FastAPI REST API with 20+ endpoints
- Supabase PostgreSQL database with pgvector
- AI embeddings using all-MiniLM-L6-v2
- Hybrid matching algorithm (semantic + reciprocity + availability)
- GPT-4 powered match explanations
- AI assistant for technical help
- Session agenda generation
- Messaging system
- Calendar export (ICS files)
- Comprehensive security (RLS, validation, sanitization)
- Rate limiting
- Content moderation

### Frontend Features ✅
- Next.js 14 with App Router
- Beautiful landing page (matching inspiration image)
- Supabase authentication
- Onboarding flow with skill input
- Dashboard with match recommendations
- Match details page with messaging
- Session scheduling
- AI assistant chat interface
- Dark mode support
- Responsive design
- Toast notifications

### AI Features ✅
- Semantic skill matching with embeddings
- Explainable match scores
- Natural language match explanations
- Session agenda generation
- Technical Q&A assistant
- Code snippet generation (≤20 lines)
- Content moderation

---

## 📊 Project Statistics

- **Total Files Created**: 40+
- **Lines of Code**: ~8,000+
- **Backend Routes**: 20+ endpoints
- **Database Tables**: 5 (users, skills, matches, sessions, messages)
- **AI Models Used**: 2 (all-MiniLM-L6-v2, GPT-4)
- **Security Features**: 10+

---

## 🔧 Troubleshooting

### "Module not found" errors in backend
```bash
pip install --upgrade -r requirements.txt
```

### "Cannot find module" errors in frontend
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection failed
- Check that your Supabase project is active
- Verify the URL and keys in `.env`
- Make sure you ran the schema.sql file

### Embedding model download is slow
- First run downloads ~80MB model
- Be patient, it only happens once
- Model is cached for future runs

### Frontend won't start
- Make sure you're in the `frontend` directory
- Check that `.env.local` exists with correct values
- Try `npm install` again

### Backend won't start
- Make sure virtual environment is activated
- Check that all environment variables are set in `.env`
- Verify Python version is 3.10+

---

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: {
    600: '#YOUR_COLOR',  // Main primary color
  },
  accent: {
    600: '#YOUR_COLOR',  // Main accent color
  },
}
```

### Change Matching Weights
Edit `backend/.env`:
```
WEIGHT_SEMANTIC=0.50      # Semantic similarity
WEIGHT_RECIPROCITY=0.25   # Level compatibility
WEIGHT_AVAILABILITY=0.15  # Schedule overlap
WEIGHT_PREFERENCE=0.10    # Language/preferences
```

### Add More Skills
Edit `backend/app/lib/constants.py` to add common skills for autocomplete.

---

## 📚 Next Steps

### Immediate Improvements
1. Add real-time messaging with WebSockets
2. Implement video call integration (Zoom/Google Meet)
3. Add user reviews and ratings
4. Create skill verification system
5. Build analytics dashboard

### Future Features
1. Mobile app (React Native)
2. Advanced scheduling with calendar sync
3. Group learning sessions
4. Skill badges and achievements
5. Community forums
6. Email notifications
7. Advanced search and filters

---

## 🐛 Known Limitations (MVP)

- No real-time messaging (polling only)
- No video calls (external links only)
- No push notifications
- No payment system
- No admin dashboard
- No analytics tracking
- Simple availability system (can be enhanced)

---

## 💡 Tips for Demo/Presentation

1. **Prepare Demo Data**: Create 3-4 users with diverse skills before the demo
2. **Highlight AI**: Show the match explanation and how it's generated
3. **Show Session Agenda**: Generate an agenda live to demonstrate AI
4. **Test Dark Mode**: Toggle dark mode to show design polish
5. **Explain Security**: Mention RLS, validation, and moderation
6. **Show Code Quality**: Open a few files to show clean structure

---

## 🎯 Success Checklist

- [ ] Database schema created in Supabase
- [ ] Backend running on localhost:8000
- [ ] Frontend running on localhost:3000
- [ ] Can create user and complete onboarding
- [ ] Skills are saved with embeddings
- [ ] Matches are discovered with explanations
- [ ] Can send messages in a match
- [ ] Can generate session agenda
- [ ] AI assistant responds to questions
- [ ] Dark mode works throughout
- [ ] No console errors

---

## 📞 Support

If you encounter issues:
1. Check the main README.md for detailed documentation
2. Review the troubleshooting section above
3. Check backend logs in terminal
4. Check browser console for frontend errors
5. Verify all environment variables are set correctly

---

**You're all set! Happy skill exchanging! 🚀**
