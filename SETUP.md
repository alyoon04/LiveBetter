# LiveBetter - Detailed Setup Guide

## Prerequisites Installation

### 1. Install PostgreSQL

#### macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow prompts
- Remember the password you set for the 'postgres' user

### 2. Install Python 3.11+

#### macOS:
```bash
brew install python@3.11
python3.11 --version
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

#### Windows:
- Download from https://www.python.org/downloads/
- Run installer, check "Add Python to PATH"

### 3. Install Node.js 18+

#### macOS:
```bash
brew install node@18
node --version
npm --version
```

#### Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Windows:
- Download from https://nodejs.org/
- Run installer

---

## Database Setup

### Step 1: Create Database

#### Option A: Using createdb command (macOS/Linux)
```bash
# Create database as current user
createdb livebetter

# Or specify user
createdb -U postgres livebetter
```

#### Option B: Using psql
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE livebetter;

# Verify database was created
\l

# Exit psql
\q
```

#### Windows (using pgAdmin or Command Prompt):
```bash
# Using psql in Command Prompt
psql -U postgres
CREATE DATABASE livebetter;
\q
```

### Step 2: Apply Database Schema

Navigate to your LiveBetter project directory:

```bash
cd /Users/alexyoon/LiveBetter

# Apply schema
psql -U postgres -d livebetter -f api/schema.sql

# Verify tables were created
psql -U postgres -d livebetter -c "\dt"
```

You should see output showing the `metro` and `metro_costs` tables.

### Step 3: Set Database Password (if needed)

If your PostgreSQL installation requires a password:

```bash
# Connect to PostgreSQL
psql -U postgres

# Set password
ALTER USER postgres PASSWORD 'your_password_here';
\q
```

---

## Backend Setup

### Step 1: Create Python Virtual Environment

```bash
cd /Users/alexyoon/LiveBetter

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
.\venv\Scripts\activate

# Your prompt should now show (venv)
```

### Step 2: Install Python Dependencies

```bash
# Make sure virtual environment is activated
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

You should see packages like:
- fastapi
- uvicorn
- psycopg2-binary
- pandas
- pydantic

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Edit the values if needed:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=livebetter
DB_USER=postgres
DB_PASSWORD=postgres  # Change if you set a different password
```

### Step 4: Run ETL Scripts to Load Data

```bash
# Make sure you're in the project root and venv is activated

# Load metros
python etl/seed_metros.py

# You should see output like:
# Loading metros from data/metros.csv...
# ✓ Loaded 90 metros
# Connecting to database...
# ...
# ✓ Successfully inserted 90 metros

# Load cost data
python etl/load_costs.py

# You should see output like:
# Loading metros from database...
# ✓ Loaded 90 metros from database
# Loading rents from data/rents.csv...
# ...
# ✓ Cost load completed successfully!
```

### Step 5: Verify Data Was Loaded

```bash
# Check metro count
psql -U postgres -d livebetter -c "SELECT COUNT(*) FROM metro;"

# Check costs count
psql -U postgres -d livebetter -c "SELECT COUNT(*) FROM metro_costs;"

# View sample data
psql -U postgres -d livebetter -c "SELECT m.name, m.state, mc.median_rent_usd, mc.rpp_index FROM metro m JOIN metro_costs mc ON m.metro_id = mc.metro_id LIMIT 5;"
```

### Step 6: Start FastAPI Server

```bash
# Navigate to api directory
cd api

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
```

### Step 7: Test API Endpoints

Open a new terminal (keep the server running) and test:

```bash
# Health check
curl http://localhost:8000/health

# You should see:
# {"status":"healthy","version":"1.0.0","metros_count":90}

# Test ranking endpoint
curl -X POST http://localhost:8000/api/rank \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 90000,
    "family_size": 1,
    "rent_cap_pct": 0.3,
    "population_min": 0,
    "limit": 10
  }'
```

You should see JSON response with ranked metros.

### Step 8: View API Documentation

Open your browser and navigate to:
- **Interactive docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

---

## Frontend Setup

Open a **new terminal** (keep the API server running in the other terminal).

### Step 1: Navigate to Frontend Directory

```bash
cd /Users/alexyoon/LiveBetter/frontend
```

### Step 2: Install Node Dependencies

```bash
# Install all dependencies
npm install

# This will take a few minutes
# You should see a progress bar and eventually:
# added XXX packages
```

If you encounter errors, try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install again
npm install
```

### Step 3: Configure Environment Variables

```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Verify it was created
cat .env.local
```

### Step 4: Start Next.js Development Server

```bash
npm run dev

# You should see:
# > livebetter-frontend@1.0.0 dev
# > next dev
#
# ▲ Next.js 14.1.0
# - Local:        http://localhost:3000
# - Ready in 2.3s
```

### Step 5: Open Application in Browser

Navigate to: **http://localhost:3000**

You should see:
- The LiveBetter home page with the form
- "Find the best city to live in for your budget" heading
- Form inputs for salary, family size, etc.

---

## Testing the Application

### 1. Test the Form Submission

1. On the home page, enter:
   - Salary: 90000
   - Household Size: 2
   - Maximum Rent: 30%
   - Minimum City Size: Any size

2. Click "Find Cities"

3. You should be redirected to the results page showing:
   - Top ranked cities
   - Interactive map with markers
   - City cards with affordability scores

### 2. Test Sorting

On the results page, try clicking different sort options:
- Affordability
- Discretionary Income
- Rent
- Cost of Living

### 3. Test Dark Mode

Click the moon/sun icon in the header to toggle dark mode.

### 4. Test Map Interaction

- Hover over city cards - the map should zoom to that city
- Click map markers to see city details in popups

### 5. View Methodology

Click "Methodology" in the header to see the detailed explanation.

---

## Running Backend Tests

```bash
# Navigate to project root
cd /Users/alexyoon/LiveBetter

# Make sure virtual environment is activated
source venv/bin/activate

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=api --cov-report=html

# View coverage report
open htmlcov/index.html  # macOS
# or
xdg-open htmlcov/index.html  # Linux
```

---

## Troubleshooting

### Database Connection Issues

**Error: "connection refused" or "could not connect to server"**

Solution:
```bash
# Check if PostgreSQL is running
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# Start if not running:
# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql
```

**Error: "password authentication failed"**

Solution:
```bash
# Reset password
psql -U postgres
ALTER USER postgres PASSWORD 'postgres';
\q

# Update .env file with correct password
```

**Error: "database 'livebetter' does not exist"**

Solution:
```bash
# Create database
createdb -U postgres livebetter

# Apply schema
psql -U postgres -d livebetter -f api/schema.sql
```

### Backend Issues

**Error: "No module named 'fastapi'"**

Solution:
```bash
# Activate virtual environment first
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Address already in use" (port 8000)**

Solution:
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use a different port
uvicorn main:app --reload --port 8001
```

**Error: "Empty results" from API**

Solution:
```bash
# Check if data was loaded
psql -U postgres -d livebetter -c "SELECT COUNT(*) FROM metro_costs;"

# If count is 0, run ETL scripts again
python etl/seed_metros.py
python etl/load_costs.py
```

### Frontend Issues

**Error: "Cannot find module" or TypeScript errors**

Solution:
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

**Error: "Failed to fetch" or "Network Error"**

Solution:
```bash
# Check API is running
curl http://localhost:8000/health

# Check .env.local has correct API URL
cat .env.local

# Should show: NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Error: Map not displaying**

Solution:
- Check browser console for errors
- Verify Leaflet CSS is loaded (check network tab)
- Try refreshing the page

### Port Conflicts

If ports 3000 or 8000 are already in use:

```bash
# Frontend - use different port
cd frontend
PORT=3001 npm run dev

# Backend - use different port
cd api
uvicorn main:app --reload --port 8001

# Update frontend .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
```

---

## Stopping the Application

### Stop Frontend
Press `CTRL+C` in the terminal running `npm run dev`

### Stop Backend
Press `CTRL+C` in the terminal running `uvicorn`

### Stop PostgreSQL (optional)
```bash
# macOS:
brew services stop postgresql@14

# Linux:
sudo systemctl stop postgresql
```

---

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit files in `api/`
   - Uvicorn auto-reloads (if running with `--reload`)
   - Test at http://localhost:8000/docs

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Next.js hot-reloads automatically
   - Changes appear immediately in browser

3. **Database Changes**:
   - Edit `api/schema.sql`
   - Drop and recreate database:
   ```bash
   dropdb -U postgres livebetter
   createdb -U postgres livebetter
   psql -U postgres -d livebetter -f api/schema.sql
   python etl/seed_metros.py
   python etl/load_costs.py
   ```

4. **Data Changes**:
   - Edit CSV files in `data/`
   - Rerun ETL scripts:
   ```bash
   python etl/seed_metros.py
   python etl/load_costs.py
   ```

---

## Next Steps

- Customize the design in `frontend/src/app/globals.css`
- Add more metros to `data/metros.csv`
- Adjust scoring parameters in `api/scoring.py`
- Add more filters to the results page
- Deploy to production (see README.md deployment section)

Happy coding!
