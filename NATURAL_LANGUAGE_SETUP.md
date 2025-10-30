# Natural Language Preference Parser - Setup Guide

This feature allows users to describe their city preferences in plain English, and the system will automatically fill out the search form using OpenAI's API.

## Prerequisites

You need an OpenAI API key to use this feature. Get one at: https://platform.openai.com/api-keys

## Setup Instructions

### 1. Add OpenAI API Key to Backend

Add your OpenAI API key to the `.env` file in the root directory:

```bash
# Add this to your .env file
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. Install Dependencies

The OpenAI SDK has already been installed in both frontend and backend:

**Backend:**
```bash
source venv/bin/activate
pip install openai
```

**Frontend:**
```bash
cd frontend
npm install openai
```

### 3. Restart Your Servers

After adding the API key, restart both servers:

**Backend:**
```bash
cd api
uvicorn main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Usage

### For Users

Users can now describe their preferences in natural language at the top of the search form. Examples:

- "I make $75k with a family of 3, I prefer public transit and care about schools"
- "Single person, $120k salary, want walkable city with good weather"
- "Family of 4, we make 95000, need good schools and safety, we drive"

The system will:
1. Parse the natural language input
2. Fill out the form automatically
3. Users can review/adjust the filled values
4. Submit to get city recommendations

### API Endpoint

The new endpoint is available at:

```
POST /api/parse-preferences
```

**Request:**
```json
{
  "text": "I make $75k with a family of 3, I prefer public transit and care about schools"
}
```

**Response:**
```json
{
  "salary": 75000,
  "family_size": 3,
  "rent_cap_pct": 0.3,
  "population_min": 0,
  "limit": 50,
  "transport_mode": "public_transit",
  "affordability_weight": 10,
  "schools_weight": 8,
  "safety_weight": 0,
  "weather_weight": 0,
  "healthcare_weight": 0,
  "walkability_weight": 0
}
```

## Features

### Smart Parsing

The system understands:

- **Salary formats**: "75k", "$75000", "75,000", etc.
- **Family descriptions**: "single", "couple", "family of 4", "me and my partner"
- **Transportation preferences**: "public transit", "drive", "car", "bike", "walkable"
- **Importance levels**:
  - "very important", "critical" → 9-10
  - "important", "care about" → 7-8
  - "nice to have" → 4-6
  - "not important" → 0-2

### Default Values

Any field not mentioned in the natural language input will use sensible defaults:
- Salary: $90,000
- Family size: 1
- Rent cap: 30% of income
- Transport mode: public transit
- Affordability weight: 10
- All other weights: 0

## Troubleshooting

### "OPENAI_API_KEY environment variable not set" error

Make sure you:
1. Added the API key to `.env` file in the root directory
2. Restarted the backend server after adding the key
3. The key starts with `sk-` (for secret key)

### Parsing errors

If the natural language parser fails:
1. Check your OpenAI API key is valid and has credits
2. Try using one of the example inputs
3. Make sure the input includes at least salary information
4. Users can always fall back to manual form entry

### Rate Limits

OpenAI has rate limits based on your account tier. If you're getting rate limit errors:
- Wait a few seconds between requests
- Consider upgrading your OpenAI account tier
- Or disable the feature by not setting the OPENAI_API_KEY

## Cost Considerations

This feature uses OpenAI's `gpt-4o-mini` model which is very cost-effective:
- Approximately $0.00015 per request (varies based on input length)
- Even with 10,000 requests, cost would be ~$1.50

## Architecture

```
User Input (Natural Language)
    ↓
Frontend Component (NaturalLanguageInput.tsx)
    ↓
POST /api/parse-preferences
    ↓
OpenAI API (gpt-4o-mini)
    ↓
Structured JSON Response
    ↓
Auto-fill Form (FormCard.tsx)
    ↓
User Reviews & Submits
```

## Files Modified/Created

### Backend
- `api/routers/nl_parser.py` - New router for NL parsing
- `api/main.py` - Added NL router

### Frontend
- `frontend/src/components/NaturalLanguageInput.tsx` - New component
- `frontend/src/components/FormCard.tsx` - Integrated NL input

### Configuration
- `.env.example` - Added OPENAI_API_KEY

## Security Notes

- Never commit your `.env` file with actual API keys
- The `.env` file is already in `.gitignore`
- Use environment variables for production deployment
- The API key is only used server-side (backend), never exposed to frontend

## Future Enhancements

Potential improvements:
- Add conversation history to refine preferences
- Support multi-turn conversations ("I also care about weather")
- Add language support beyond English
- Cache common queries to reduce API costs
- Add validation feedback before filling form
