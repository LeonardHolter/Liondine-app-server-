# 🦁 Lion Dine Menu API - Quick Start

## What This Does

This API scrapes the Lion Dine menu website and uses OpenAI to convert the unstructured text into clean, structured JSON data.

**Input:** https://liondine.com/breakfast (raw HTML)  
**Output:** Structured JSON with dining halls, stations, and food items

---

## Getting Started (3 Steps)

### 1. Set Your OpenAI API Key

Create a `.env` file:
```bash
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

Get your API key at: https://platform.openai.com/api-keys

### 2. Install Dependencies (if not done)

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

The server will start at http://localhost:3000

---

## Usage

### Option 1: Web Interface (Easiest)

Open your browser to:
```
http://localhost:3000/test
```

Select a meal type and click "Fetch Menu" to see the structured results.

### Option 2: API Request

```bash
curl http://localhost:3000/api/menu?meal=breakfast
```

### Option 3: JavaScript/Fetch

```javascript
fetch('http://localhost:3000/api/menu?meal=breakfast')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Available Meal Types

- `breakfast`
- `lunch`
- `dinner`
- `latenight`

---

## Example Response

```json
{
  "mealType": "breakfast",
  "timestamp": "2026-01-28T12:34:56.789Z",
  "diningHalls": [
    {
      "name": "Ferris",
      "hours": "7:30 AM to 11:00 AM",
      "status": "open",
      "stations": [
        {
          "name": "Main Line",
          "items": ["Apple Pancakes", "Scrambled Eggs", ...]
        },
        {
          "name": "Vegan Station",
          "items": ["Tofu Scramble", "Ratatouille", ...]
        }
      ]
    }
  ]
}
```

---

## Project Structure

```
liondine/
├── app/
│   ├── api/menu/route.ts       # Main API endpoint
│   ├── test/page.tsx           # Test UI
│   └── page.tsx                # Home page
├── lib/
│   ├── scraper.ts              # Web scraper
│   └── openai.ts               # AI integration
├── types/
│   └── menu.ts                 # TypeScript types
├── scripts/
│   └── test-menu-parsing.ts    # Test script
└── .env                        # Your API key (create this!)
```

---

## Testing

### Test with Sample Data (No Web Scraping)

```bash
npm run test:parse
```

This runs the OpenAI structuring on sample menu text without hitting the website.

### Test Full API (With Web Scraping)

```bash
# Start server
npm run dev

# In another terminal
curl http://localhost:3000/api/menu?meal=breakfast
```

---

## Troubleshooting

### "OpenAI API key not configured"
➡️ Create a `.env` file with your `OPENAI_API_KEY`

### "Module not found" errors
➡️ Run `npm install`

### Server won't start
➡️ Make sure port 3000 is available or use: `PORT=3001 npm run dev`

### Empty or invalid response
➡️ Check if https://liondine.com is accessible  
➡️ Verify your OpenAI API key is valid

---

## Cost

- Each API call costs approximately **$0.01-0.03** (using GPT-4o)
- Responses are cached for 5 minutes to reduce costs
- Consider adding Redis caching for production

---

## Next Steps

1. ✅ Test the API with different meal types
2. ✅ Review the structured JSON output
3. ✅ Integrate into your application
4. Consider adding:
   - Database storage for menu history
   - Caching layer (Redis/Upstash)
   - Rate limiting
   - Authentication

---

## Need Help?

- Check `SETUP.md` for detailed documentation
- Check `README.md` for project overview
- Review the code in `app/api/menu/route.ts`

---

## Architecture Flow

```
User Request
    ↓
API Endpoint (/api/menu?meal=breakfast)
    ↓
Web Scraper (lib/scraper.ts)
    ↓
Fetch HTML from liondine.com
    ↓
Extract text content
    ↓
OpenAI GPT-4 (lib/openai.ts)
    ↓
Structure into JSON
    ↓
Return to User
```

---

**Made with ❤️ for Columbia dining**
