# UAE Job Tracker 🇦🇪

Live job search dashboard for UAE Frontend/Engineering roles. Powered by JSearch API (LinkedIn, Indeed, Glassdoor) with AI cover note generation.

## Deploy to Render (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/uae-job-tracker.git
git push -u origin main
```

### Step 2 — Create Render Web Service
1. Go to **render.com** → Sign up free
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Set these settings:
   - **Name:** `uae-job-tracker`
   - **Root Directory:** *(leave empty)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3 — Add Environment Variable
In Render dashboard → **Environment** tab:
- Key: `RAPIDAPI_KEY`
- Value: `your_rapidapi_key_here`

### Step 4 — Deploy
Click **"Create Web Service"** — Render builds and deploys automatically.
Your app will be live at: `https://uae-job-tracker.onrender.com`

---

## Local Development

```bash
# Install deps
npm run install:all

# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

---

## Features
- 🔴 Live jobs from LinkedIn, Indeed, Glassdoor via JSearch
- 📊 Match score against your skills profile
- ✨ AI cover note per job (Anthropic API)
- 🔖 Save & ✅ track applications
- ⚡ Quick search presets for UAE Frontend roles
