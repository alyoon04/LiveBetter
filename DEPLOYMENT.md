# LiveBetter Deployment Guide

## Quick Deployment Checklist

- [ ] Backend deployed (Railway/Render)
- [ ] Database provisioned and seeded
- [ ] ETL scripts run successfully
- [ ] Backend API URL obtained
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Test end-to-end functionality

---

## Backend Deployment (Railway - Recommended)

### Step 1: Prepare Your Repository

```bash
# Make sure you're in the project root
cd /Users/alexyoon/LiveBetter

# Initialize git if not already done
git init

# Create .gitignore if needed
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.egg-info/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite

# Node
node_modules/
.next/
out/
build/

# OS
.DS_Store
Thumbs.db
EOF

# Commit everything
git add .
git commit -m "Prepare for deployment"

# Create GitHub repo (if not exists)
gh repo create LiveBetter --private --source=. --remote=origin --push
```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `LiveBetter` repository
   - Select the `main` branch

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will provision a database

4. **Add Redis (Optional but Recommended)**
   - In your project, click "New"
   - Select "Database" → "Add Redis"
   - Railway will provision a Redis instance

5. **Configure Backend Service**
   - Click on your service (Python app)
   - Go to "Variables" tab
   - Add these variables:
     ```
     # Database
     DB_HOST=${{Postgres.PGHOST}}
     DB_PORT=${{Postgres.PGPORT}}
     DB_NAME=${{Postgres.PGDATABASE}}
     DB_USER=${{Postgres.PGUSER}}
     DB_PASSWORD=${{Postgres.PGPASSWORD}}

     # Required API Keys
     BEA_API_KEY=<your-bea-api-key>

     # Recommended: Enables AI-powered natural language search
     OPENAI_API_KEY=<your-openai-api-key>

     # Optional: Redis caching (if you added Redis in step 4)
     REDIS_ENABLED=true
     REDIS_HOST=${{Redis.REDIS_HOST}}
     REDIS_PORT=${{Redis.REDIS_PORT}}
     CACHE_TTL_HOURS=24

     # Optional: Other API keys
     CENSUS_API_KEY=<your-census-key-if-any>
     AIRNOW_API_KEY=<your-airnow-key-if-any>
     ```

6. **Set Start Command**
   - Go to "Settings" tab
   - Under "Deploy", set custom start command:
     ```
     cd api && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

7. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete (green checkmark)

### Step 3: Seed Database

**Option A: Railway Shell (Recommended)**
```bash
# In Railway dashboard, click on your service
# Click "Shell" button at top
# Run these commands:
python etl/seed_metros.py
python etl/load_costs.py
python etl/update_census_population.py
```

**Option B: Connect Locally**
```bash
# Get database connection string from Railway dashboard
# In "Variables" tab, click "DATABASE_URL"

# Set environment variables locally
export DATABASE_URL="postgresql://..."

# Run ETL scripts
source venv/bin/activate
python etl/seed_metros.py
python etl/load_costs.py
python etl/update_census_population.py
```

### Step 4: Test Backend

```bash
# Get your Railway URL (e.g., https://your-app.up.railway.app)
# Test health endpoint
curl https://your-app.up.railway.app/health

# Should return:
# {"status":"healthy","version":"1.0.0","metros_count":88}

# Test ranking endpoint
curl -X POST https://your-app.up.railway.app/api/rank \
  -H "Content-Type: application/json" \
  -d '{"salary":90000,"family_size":1,"rent_cap_pct":0.3,"population_min":0,"limit":10}'
```

### Step 5: Note Your API URL

Save your Railway API URL for the frontend deployment:
```
https://your-app.up.railway.app
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
cd /Users/alexyoon/LiveBetter/frontend

# Test build locally first
npm run build

# If build succeeds, commit any changes
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your `LiveBetter` GitHub repo
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Set Environment Variables**
   - Before deploying, add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
     ```
   - Replace with your actual Railway URL

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide a URL like: `https://live-better.vercel.app`

### Step 3: Test Frontend

1. Visit your Vercel URL
2. Fill out the form with test data:
   - Salary: $90,000
   - Household: 2 people
   - Click "Find Cities"
3. Verify results load correctly
4. Check map displays properly
5. Test sorting and filtering

---

## Custom Domain (Optional)

### For Vercel Frontend

1. **In Vercel Dashboard**
   - Go to your project → "Settings" → "Domains"
   - Add your domain (e.g., `livebetter.com`)

2. **Configure DNS**
   - Add CNAME record in your DNS provider:
     ```
     CNAME  www  cname.vercel-dns.com
     CNAME  @    cname.vercel-dns.com
     ```

3. **Update Environment Variable**
   - No need to change API URL (using full domain)

### For Railway Backend

1. **In Railway Dashboard**
   - Go to your service → "Settings" → "Networking"
   - Add custom domain (e.g., `api.livebetter.com`)

2. **Configure DNS**
   - Add CNAME record:
     ```
     CNAME  api  <provided-by-railway>
     ```

3. **Update Vercel Environment Variable**
   - Change `NEXT_PUBLIC_API_URL` to `https://api.livebetter.com`
   - Redeploy frontend on Vercel

---

## Environment Variables Summary

### Backend (Railway)
```bash
# Database (Required)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# API Keys (Required)
BEA_API_KEY=your_bea_api_key

# Natural Language Search (Recommended)
OPENAI_API_KEY=your_openai_api_key

# Redis Caching (Optional but Recommended)
REDIS_ENABLED=true
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
CACHE_TTL_HOURS=24

# Other Optional Keys
CENSUS_API_KEY=your_census_key
AIRNOW_API_KEY=your_airnow_key
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Railway
- Automatically deploys on push to `main` branch
- Watches for changes in backend code

### Vercel
- Automatically deploys on push to `main` branch
- Creates preview deployments for pull requests

### To Deploy Updates:
```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Both services will auto-deploy
```

---

## Monitoring & Logs

### Railway
- Dashboard → Your Service → "Logs" tab
- Real-time logs of API requests and errors
- Metrics for CPU, memory, network usage

### Vercel
- Dashboard → Your Project → "Deployments" tab
- Click deployment → "Functions" → View logs
- Real-time function execution logs

---

## Troubleshooting

### Backend Issues

**"Database connection failed"**
```bash
# Check database is running
# In Railway: Click on Postgres service → "Metrics"

# Verify environment variables are set correctly
# In Railway: Click service → "Variables" tab

# Check logs
# In Railway: Click service → "Logs" tab
```

**"No metros found"**
```bash
# Database might not be seeded
# Run ETL scripts in Railway Shell:
python etl/seed_metros.py
python etl/load_costs.py
```

**"502 Bad Gateway"**
```bash
# Check start command is correct
# Should be: cd api && uvicorn main:app --host 0.0.0.0 --port $PORT

# Check logs for Python errors
```

### Frontend Issues

**"Failed to fetch" or CORS errors**
```bash
# Verify NEXT_PUBLIC_API_URL is set correctly
# In Vercel: Settings → Environment Variables

# Make sure API URL doesn't have trailing slash
# Good: https://api.railway.app
# Bad:  https://api.railway.app/

# Check backend CORS settings in api/main.py
# Should allow your Vercel domain
```

**"Build failed" on Vercel**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variable not set

# Test build locally first:
cd frontend
npm run build
```

**Map not loading**
```bash
# Check browser console for Leaflet errors
# Verify Leaflet CSS is loading
# Check network tab for failed requests
```

---

## Cost Estimate

### Free Tier (Hobby Project)
- **Railway:** $5/month (500 hours + PostgreSQL)
  - Add Redis: +$3/month (optional but recommended for caching)
- **Vercel:** Free (100GB bandwidth, unlimited requests)
- **OpenAI API:** ~$0.50-2/month (GPT-4o-mini for natural language parsing, extremely cost-effective)
- **Total:** ~$6-10/month

### Paid Tier (Production)
- **Railway:** $20/month (Pro plan with better resources + PostgreSQL + Redis)
- **Vercel:** $20/month (Pro plan with analytics)
- **OpenAI API:** ~$5-20/month (scales with usage, GPT-4o-mini is very cheap)
- **Total:** ~$45-60/month

---

## Security Best Practices

1. **Never commit secrets**
   ```bash
   # Check .gitignore includes:
   .env
   .env.local
   .env.production.local
   ```

2. **Use environment variables**
   - All secrets in Railway/Vercel dashboards
   - Never hardcode API keys or passwords

3. **Enable HTTPS only**
   - Both Railway and Vercel provide free SSL
   - Redirect HTTP to HTTPS automatically

4. **Rate limiting** (TODO for production)
   - Add rate limiting to API endpoints
   - Use middleware or Railway's built-in protection

5. **CORS configuration**
   - Update `api/main.py` to restrict origins:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## Next Steps After Deployment

1. **Verify Features**
   - Test natural language search functionality (if OpenAI key configured)
   - Verify Redis caching is working (check Railway logs for cache hits)
   - Test all transportation modes and quality of life filters

2. **Add Analytics**
   - Vercel Analytics for frontend metrics
   - Railway metrics for backend monitoring
   - Track natural language query usage and accuracy

3. **Set up Monitoring**
   - Railway alerts for downtime
   - Error tracking (Sentry)
   - Monitor OpenAI API usage and costs

4. **Performance Optimization**
   - Verify Redis caching is reducing database queries
   - Add database indexes for frequently queried columns
   - Monitor cache hit/miss rates

5. **Backup Database**
   - Railway provides automatic PostgreSQL backups
   - Export Redis data periodically if using for critical caching

6. **Custom Domain**
   - Purchase domain (Namecheap, Google Domains)
   - Configure DNS as described above
   - Update CORS settings in api/main.py to match your domain

---

## Quick Commands Reference

### Deploy Backend Update
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys
```

### Deploy Frontend Update
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### View Backend Logs
```bash
# In Railway dashboard:
# Your Service → Logs tab
```

### View Frontend Logs
```bash
# In Vercel dashboard:
# Your Project → Deployments → Click deployment → Functions
```

### Run Database Migration
```bash
# In Railway Shell:
psql $DATABASE_URL -f api/schema.sql
python etl/seed_metros.py
```

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Next.js Deployment:** https://nextjs.org/docs/deployment

Good luck with your deployment! 🚀
