# Manual Data Sources Guide

Since automated API access has limitations, here's how to get real production data manually.

## Rent Data (Choose One)

### Option 1: Zillow Research Data (Recommended - Most Current)

**Steps:**
1. Go to: https://www.zillow.com/research/data/
2. Find "Rental Data" section
3. Download "ZORI (Smoothed): All Homes Plus Multifamily Time Series ($)" - Metro level
4. Save to: `data/zillow_rent_metro.csv`
5. Run: `python etl/load_zillow_rents.py`

**Pros:**
- ✅ Updated monthly
- ✅ Most current data
- ✅ Covers 50+ major metros
- ✅ Free, no signup

**Cons:**
- ❌ Manual download required
- ❌ Doesn't cover all small metros

### Option 2: HUD Fair Market Rents (Most Comprehensive)

**Steps:**
1. Go to: https://www.huduser.gov/portal/datasets/fmr.html
2. Download latest FY 2024 or 2025 data
3. Choose "Metro Area FMRs" Excel or CSV
4. Save to: `data/hud_fmr.csv`
5. Run: `python etl/load_hud_rents.py`

**Pros:**
- ✅ Most comprehensive (covers all metros)
- ✅ Official government data
- ✅ Free, no signup
- ✅ Includes bedroom-specific rents

**Cons:**
- ❌ Updated annually (October)
- ❌ Can lag by 6-12 months

## Population Data

✅ **Already working via Census API** - No manual download needed!

## Regional Price Parity

⏳ **Waiting for BEA API activation** - Will work once activated

Alternatively, download manually:
1. Go to: https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area
2. Download latest Excel file
3. Save to: `data/bea_rpp.csv`
4. Run: `python etl/load_bea_rpp.py`

## Air Quality

✅ **Already working via EPA API** - Real-time data!

## Quick Start for Production

**Minimum viable data (5 minutes):**

1. **Download Zillow rent data**
   - https://www.zillow.com/research/data/
   - Look for "ZORI (Smoothed)" Metro data
   - ~2MB file

2. **Your Census API is working** - population data is ready!

3. **Wait for BEA activation** (or download RPP CSV)

4. **EPA is working** - air quality is ready!

That's it! You'll have:
- ✅ Accurate rents from Zillow
- ✅ Accurate populations from Census API
- ✅ Accurate air quality from EPA API
- ⏳ Accurate RPP from BEA (pending)

## Update Schedule

| Data Type | Source | Update Frequency | Method |
|-----------|--------|------------------|--------|
| Population | Census API | Automatic | API (working) |
| Rent | Zillow Download | Monthly manual | CSV download |
| RPP | BEA API | Automatic | API (activating) |
| Air Quality | EPA API | Real-time | API (working) |

## For True Automation (Advanced)

If you want fully automated updates without manual downloads:

1. **Rent**: Partner with a paid data provider (RentCast, Redfin API, etc.) or build web scrapers
2. **RPP**: Wait for BEA API activation (should be soon!)
3. **Everything else**: Already automated via APIs ✅

## My Recommendation

**For MVP Launch:**
- Manual Zillow download (one-time, 5 min) ✅ Best ROI
- Use Census API (already working) ✅
- Use EPA API (already working) ✅
- Use sample RPP data until BEA activates ⏳

**For Production Scale:**
- Automate with BEA API once activated
- Set up monthly Zillow download reminder
- Or switch to paid rent data API

**Total setup time: ~10 minutes for production-quality data!**
