# 🦁 Lion Dine Menu API

A Next.js API that scrapes the Lion Dine menu website and structures the data into clean JSON format using OpenAI GPT-4o and intelligent caching.

## ✨ Features

- 🕷️ Web scraping of Lion Dine menu pages (Breakfast, Lunch, Dinner, Late Night)
- 🤖 AI-powered menu data structuring using OpenAI GPT-4o
- ⚡ Smart caching system (24-hour cache, 99% faster responses)
- 🔄 RESTful API endpoints
- 📦 Structured JSON output
- 🚀 Production-ready with Railway deployment
- 📊 Built-in cache management

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Run development server:**
```bash
npm run dev
```

API available at: `http://localhost:3000`

### Deploy to Production

Deploy to Railway in minutes! See [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) for step-by-step guide.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## 📡 API Endpoints

### Get Menu
```
GET /api/menu?meal={mealType}
```

**Parameters:**
- `meal` (required): `breakfast` | `lunch` | `dinner` | `latenight`
- `refresh` (optional): `true` to bypass cache

**Example:**
```bash
curl "https://your-api.up.railway.app/api/menu?meal=breakfast"
```

### Cache Stats
```
GET /api/cache
```

View cache statistics and entries.

### Clear Cache
```
DELETE /api/cache
```

Clear all cached data.

### Health Check
```
GET /api/health
```

Check API status and uptime.

## 📦 Response Format

```json
{
  "mealType": "breakfast",
  "timestamp": "2026-01-28T...",
  "diningHalls": [
    {
      "name": "Ferris",
      "hours": "7:30 AM to 11:00 AM",
      "status": "open",
      "stations": [
        {
          "name": "Main Line",
          "items": ["Apple Pancakes", "Scrambled Eggs", ...]
        }
      ]
    }
  ]
}
```

## ⚡ Performance

- **First request (cache miss):** 20-45 seconds
- **Cached requests:** ~0.01 seconds (1,880x faster!)
- **Cache duration:** 24 hours (automatic daily refresh)
- **Cost savings:** 96% reduction in API costs

## 📚 Documentation

- 📱 **[FOR_IOS_DEVELOPER.md](./FOR_IOS_DEVELOPER.md)** - iOS integration guide
- 🔧 **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - Complete API guide with code examples
- ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick lookup reference
- 🎯 **[CACHING_GUIDE.md](./CACHING_GUIDE.md)** - Caching system documentation
- 🚂 **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** - Deploy to production
- 📖 **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** - Technical deep dive
- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 3 steps

## 🛠️ Technology Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **AI:** OpenAI GPT-4o
- **Web Scraping:** Axios + Cheerio
- **Caching:** In-memory (upgradeable to Redis)
- **Deployment:** Railway (or Vercel)

## 🏗️ Architecture

```
Client Request
    ↓
API Endpoint
    ↓
Cache Check → [HIT] → Return Instant ⚡
    ↓ [MISS]
Web Scraper (5-10s)
    ↓
Extract Text
    ↓
OpenAI GPT-4o (15-35s)
    ↓
Structure JSON
    ↓
Store in Cache + Return
```

## 💰 Cost Estimate

### With Caching:
- **Development:** Free (within OpenAI free tier)
- **Production:** ~$2-5/month (Railway + OpenAI)
- **Per request (cached):** $0.00
- **Per request (uncached):** ~$0.01-0.03

### Without Caching:
- **100 requests/day:** ~$60/month
- **With caching:** ~$2.40/month (96% savings!)

## 🔐 Environment Variables

```bash
OPENAI_API_KEY=sk-proj-...     # Required: Your OpenAI API key
```

## 🚢 Deployment Options

1. **Railway** (Recommended) - See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
2. **Vercel** - One-click deployment
3. **Any Node.js hosting** - Works anywhere

## 📱 iOS Integration

Your iOS app can consume this API easily. See complete Swift examples in [FOR_IOS_DEVELOPER.md](./FOR_IOS_DEVELOPER.md).

```swift
let url = URL(string: "https://your-api.up.railway.app/api/menu?meal=breakfast")!
let (data, _) = try await URLSession.shared.data(from: url)
let menu = try JSONDecoder().decode(MenuResponse.self, from: data)
```

## 🧪 Testing

```bash
# Test breakfast menu
curl "http://localhost:3000/api/menu?meal=breakfast"

# Test with timing
time curl "http://localhost:3000/api/menu?meal=breakfast"

# View cache stats
curl "http://localhost:3000/api/cache"

# Force refresh (bypass cache)
curl "http://localhost:3000/api/menu?meal=breakfast&refresh=true"

# Check health
curl "http://localhost:3000/api/health"
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional data sources
- More caching strategies
- Nutritional information extraction
- Dietary restrictions filtering
- Historical menu tracking

## 📄 License

MIT License - feel free to use this for your own projects!

## 👨‍💻 Author

Built for Columbia University dining services integration.

---

**Need help?** Check the documentation files or open an issue!
# Liondine-app-server-
