# Lion Dine Menu API - Setup Guide

## Overview

This API scrapes the Lion Dine menu website (https://liondine.com) and uses OpenAI to structure the menu data into a clean JSON format.

## Architecture

```
┌─────────────────┐
│  Client Request │
│  /api/menu?meal=│
│    breakfast    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  API Endpoint   │
│  (route.ts)     │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         v              v
┌─────────────┐  ┌─────────────┐
│  Web Scraper│  │  OpenAI LLM │
│  (scraper)  │─>│  (openai)   │
└─────────────┘  └─────────────┘
         │              │
         └──────┬───────┘
                v
        ┌──────────────┐
        │ Structured   │
        │ JSON Response│
        └──────────────┘
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-...your-key-here
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste it into your `.env` file

### 3. Run the Development Server

```bash
npm run dev
```

The API will be available at http://localhost:3000

## Usage

### API Endpoint

```
GET /api/menu?meal={mealType}
```

**Query Parameters:**
- `meal` (required): One of `breakfast`, `lunch`, `dinner`, or `latenight`

**Example Request:**
```bash
curl http://localhost:3000/api/menu?meal=breakfast
```

### Response Format

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
          "items": [
            "Apple Pancakes",
            "Scrambled Eggs",
            "Roasted Breakfast Potatoes",
            "Sliced Ham",
            "Turkey Sausage"
          ]
        },
        {
          "name": "Vegan Station",
          "items": [
            "Tofu Scramble",
            "Ratatouille",
            "Beyond Sausage"
          ]
        }
      ]
    },
    {
      "name": "Faculty House",
      "hours": "",
      "status": "closed",
      "stations": []
    }
  ]
}
```

## Testing

### Test with Sample Data

Install tsx for running TypeScript directly:
```bash
npm install -g tsx
```

Run the test script:
```bash
export OPENAI_API_KEY=your_key_here
npx tsx scripts/test-menu-parsing.ts
```

### Test the API Endpoint

1. Start the dev server:
```bash
npm run dev
```

2. Make a request:
```bash
curl http://localhost:3000/api/menu?meal=breakfast
```

Or open in your browser:
```
http://localhost:3000/api/menu?meal=breakfast
```

## Components

### `/app/api/menu/route.ts`
- Main API endpoint
- Handles request validation
- Orchestrates scraping and AI processing
- Returns structured JSON

### `/lib/scraper.ts`
- Web scraping utilities
- Fetches content from liondine.com
- Cleans and extracts menu text
- Uses Axios and Cheerio

### `/lib/openai.ts`
- OpenAI integration
- Sends menu text to GPT-4
- Receives structured JSON response
- Validates output format

### `/types/menu.ts`
- TypeScript type definitions
- Menu data structure
- Type safety across the app

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS (Amplify, Lambda)
- Google Cloud Run
- Any Node.js hosting platform

Make sure to:
1. Set the `OPENAI_API_KEY` environment variable
2. Use Node.js 18+ runtime
3. Set build command: `npm run build`
4. Set start command: `npm run start`

## Cost Considerations

- **OpenAI API**: ~$0.01-0.03 per request (using GPT-4o)
- **Caching**: Response is cached for 5 minutes (s-maxage=300)
- Consider implementing additional caching for production

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `.env` file exists and contains `OPENAI_API_KEY`
- Restart the dev server after adding the key

### "Failed to scrape menu page"
- Check if liondine.com is accessible
- Verify network connectivity
- Check if the website structure has changed

### "Failed to structure menu data"
- Check OpenAI API key is valid
- Verify you have credits/quota available
- Check OpenAI service status

## Future Enhancements

- [ ] Add caching layer (Redis/Upstash)
- [ ] Add rate limiting
- [ ] Support for multiple campuses/universities
- [ ] WebSocket updates for real-time menu changes
- [ ] Historical menu data storage
- [ ] Nutritional information extraction
- [ ] Dietary restrictions filtering (vegan, halal, etc.)
