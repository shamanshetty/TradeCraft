# TradeCraft MVP - Setup Checklist

## ✅ Pre-Setup Requirements

- [ ] Python 3.10 or higher installed
  ```bash
  python --version
  ```

- [ ] Node.js 18 or higher installed
  ```bash
  node --version
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

- [ ] Supabase account created at [supabase.com](https://supabase.com)

- [ ] OpenAI API key obtained from [platform.openai.com](https://platform.openai.com)

---

## 📋 Step-by-Step Setup

### Phase 1: Database Setup (10 minutes)

- [ ] Log in to Supabase
- [ ] Create new project
- [ ] Wait for project initialization
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy entire `database/schema.sql` file
- [ ] Paste and run the SQL
- [ ] Verify tables created:
  - [ ] users
  - [ ] skills
  - [ ] matches
  - [ ] sessions
  - [ ] messages
- [ ] Go to Project Settings → API
- [ ] Copy Project URL
- [ ] Copy `anon` `public` key
- [ ] Copy `service_role` `secret` key

### Phase 2: Backend Setup (15 minutes)

- [ ] Open terminal in `backend` directory
- [ ] Create virtual environment:
  ```bash
  python -m venv venv
  ```
- [ ] Activate virtual environment:
  - Windows: `venv\Scripts\activate`
  - Mac/Linux: `source venv/bin/activate`
- [ ] Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- [ ] Copy environment file:
  ```bash
  copy .env.example .env  # Windows
  cp .env.example .env    # Mac/Linux
  ```
- [ ] Edit `.env` file and add:
  - [ ] `SUPABASE_URL=<your_project_url>`
  - [ ] `SUPABASE_KEY=<your_anon_key>`
  - [ ] `SUPABASE_SERVICE_KEY=<your_service_role_key>`
  - [ ] `OPENAI_API_KEY=<your_openai_key>`
  - [ ] `SECRET_KEY=<generate_with_openssl>`
    ```bash
    # Generate secret key:
    openssl rand -hex 32
    ```
- [ ] Verify all environment variables are set
- [ ] Test backend startup:
  ```bash
  python main.py
  ```
- [ ] Verify backend is running on http://localhost:8000
- [ ] Open http://localhost:8000/docs in browser
- [ ] Verify API documentation loads

### Phase 3: Frontend Setup (10 minutes)

- [ ] Open new terminal in `frontend` directory
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Copy environment file:
  ```bash
  copy .env.example .env.local  # Windows
  cp .env.example .env.local    # Mac/Linux
  ```
- [ ] Edit `.env.local` file and add:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=<your_project_url>`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>`
  - [ ] `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Verify all environment variables are set
- [ ] Test frontend startup:
  ```bash
  npm run dev
  ```
- [ ] Verify frontend is running on http://localhost:3000
- [ ] Open http://localhost:3000 in browser
- [ ] Verify landing page loads correctly

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Health check works:
  ```bash
  curl http://localhost:8000/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] API docs accessible:
  - Open http://localhost:8000/docs
  - Verify Swagger UI loads

- [ ] No startup errors in terminal

### Frontend Tests

- [ ] Landing page loads:
  - Open http://localhost:3000
  - Verify no console errors (F12 → Console)

- [ ] Navigation works:
  - Click "Get Started" button
  - Verify redirects to /auth

- [ ] Styles load correctly:
  - Verify blue and green colors
  - Verify fonts load (Inter)
  - Verify no broken images

### Integration Tests

- [ ] Create test user:
  1. Go to http://localhost:3000/auth
  2. Enter email
  3. Click "Send magic link"
  4. Check email inbox
  5. Click verification link
  6. Verify redirects to onboarding

- [ ] Complete onboarding:
  1. Enter name and bio
  2. Add teach skill (e.g., "React", level 5)
  3. Add learn skill (e.g., "Python", level 2)
  4. Add availability
  5. Submit
  6. Verify redirects to dashboard

- [ ] Check backend logs:
  - Verify embedding generation logged
  - Verify no errors

- [ ] Check database:
  - Go to Supabase → Table Editor
  - Verify user created in `users` table
  - Verify skills created in `skills` table
  - Verify embeddings are not null

---

## 🔍 Verification Checklist

### Database Verification

- [ ] All 5 tables exist:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```

- [ ] pgvector extension enabled:
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'vector';
  ```

- [ ] RLS policies active:
  ```sql
  SELECT tablename, policyname FROM pg_policies;
  ```

### Backend Verification

- [ ] All routes registered:
  - Check http://localhost:8000/docs
  - Verify 20+ endpoints listed

- [ ] Environment variables loaded:
  - Check terminal output on startup
  - Verify no "Missing env var" errors

- [ ] Dependencies installed:
  ```bash
  pip list | grep fastapi
  pip list | grep supabase
  pip list | grep sentence-transformers
  ```

### Frontend Verification

- [ ] Dependencies installed:
  ```bash
  npm list next
  npm list react
  npm list @supabase/supabase-js
  ```

- [ ] Build succeeds:
  ```bash
  npm run build
  ```

- [ ] TypeScript compiles:
  ```bash
  npm run type-check
  ```

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" error:**
```bash
pip install --upgrade -r requirements.txt
```

**"Database connection failed":**
- Verify Supabase URL in `.env`
- Check Supabase project is active
- Verify keys are correct

**"Embedding model download slow":**
- First run downloads ~80MB
- Be patient, only happens once
- Model cached in `~/.cache/huggingface`

**"OpenAI API error":**
- Verify API key is correct
- Check you have credits
- Test key at platform.openai.com

### Frontend Issues

**"Cannot find module" error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Environment variable undefined":**
- Verify `.env.local` exists
- Check variable names start with `NEXT_PUBLIC_`
- Restart dev server after changes

**"Supabase auth not working":**
- Verify Supabase URL and key
- Check Supabase project settings
- Enable email auth in Supabase dashboard

### Database Issues

**"pgvector not found":**
- Enable extension in Supabase dashboard
- Or run: `CREATE EXTENSION vector;`

**"RLS policy error":**
- Verify you're authenticated
- Check RLS policies in schema.sql
- Disable RLS temporarily for testing

---

## ✨ Success Indicators

### You're ready to demo when:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Landing page looks like inspiration image
- [ ] Can create user account
- [ ] Can add skills
- [ ] Skills have embeddings in database
- [ ] Can discover matches (with 2+ users)
- [ ] Match explanations are generated
- [ ] AI assistant responds to questions
- [ ] Dark mode toggles correctly
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## 📊 Final Checklist

### Documentation
- [ ] README.md reviewed
- [ ] QUICKSTART.md followed
- [ ] PROJECT_SUMMARY.md read
- [ ] FILE_STRUCTURE.md understood

### Code Quality
- [ ] No syntax errors
- [ ] No TypeScript errors
- [ ] No Python import errors
- [ ] Environment variables set
- [ ] Git repository initialized (optional)

### Demo Preparation
- [ ] 2-3 test users created
- [ ] Complementary skills added
- [ ] Matches discovered
- [ ] Session agenda generated
- [ ] Screenshots taken (optional)

---

## 🎯 Next Steps

After completing this checklist:

1. **Test the full flow** with 2 users
2. **Prepare demo script** (see PROJECT_SUMMARY.md)
3. **Take screenshots** of key features
4. **Practice presentation** (5-10 minutes)
5. **Deploy** (optional - Vercel + Railway)

---

## 🆘 Getting Help

If stuck:
1. Check terminal/console for errors
2. Review troubleshooting section above
3. Verify all checkboxes are completed
4. Check Supabase dashboard for data
5. Test each component individually

---

**Good luck with your hackathon! 🚀**
