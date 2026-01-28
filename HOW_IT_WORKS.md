# How the Lion Dine Menu API Works

## 🎯 Overview

This API transforms unstructured HTML from the Lion Dine website into clean, structured JSON data using web scraping and AI.

**Input:** Raw HTML from https://liondine.com/breakfast  
**Output:** Structured JSON with dining halls, stations, and menu items  
**Time:** ~20-45 seconds per request

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT REQUEST                          │
│  GET /api/menu?meal=breakfast                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API ENDPOINT (route.ts)                    │
│  - Validates meal parameter                                  │
│  - Checks OpenAI API key exists                             │
│  - Orchestrates scraping + AI processing                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
                    ▼         ▼
         ┌──────────────┐  ┌──────────────┐
         │   SCRAPER    │  │   OPENAI     │
         │ (scraper.ts) │  │ (openai.ts)  │
         └──────┬───────┘  └───────┬──────┘
                │                   │
                ▼                   ▼
         ┌──────────────┐  ┌──────────────┐
         │ Fetch HTML   │  │  GPT-4o      │
         │ from website │  │  Parses &    │
         │              │  │  Structures  │
         └──────┬───────┘  └───────┬──────┘
                │                   │
                └─────────┬─────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │   STRUCTURED JSON RESPONSE     │
         │   - mealType                   │
         │   - timestamp                  │
         │   - diningHalls[]              │
         │     - name, hours, status      │
         │     - stations[]               │
         │       - name, items[]          │
         └────────────────────────────────┘
```

---

## 🔄 Step-by-Step Flow

### Step 1: Client Makes Request

```
GET http://localhost:3000/api/menu?meal=breakfast
```

**What happens:**
- Client (iOS app, browser, cURL) sends HTTP GET request
- Query parameter `meal` specifies which meal type to fetch

---

### Step 2: API Endpoint Validates Request

**File:** `app/api/menu/route.ts`

```typescript
// Extract and validate meal parameter
const meal = searchParams.get('meal');

// Validate it's one of: breakfast, lunch, dinner, latenight
if (!VALID_MEAL_TYPES.includes(meal)) {
  return error response
}

// Check OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  return error response
}
```

**What's checked:**
- ✅ Meal parameter exists
- ✅ Meal is valid type (breakfast/lunch/dinner/latenight)
- ✅ OpenAI API key is configured

---

### Step 3: Web Scraping

**File:** `lib/scraper.ts`

```typescript
export async function scrapeMenuPage(mealType: string): Promise<string> {
  // 1. Construct URL
  const url = `https://liondine.com/${mealType}`;
  
  // 2. Make HTTP request with user agent
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0...'
    }
  });
  
  // 3. Parse HTML with Cheerio
  const $ = cheerio.load(response.data);
  
  // 4. Remove unnecessary elements
  $('script, style').remove();
  
  // 5. Extract text content
  const bodyText = $('body').text();
  
  // 6. Clean up whitespace
  return bodyText.replace(/\s+/g, ' ').trim();
}
```

**Time:** ~5-10 seconds

**What you get:** Raw text like this:
```
Lion Dine 🦁 Breakfast Lunch Dinner Late Night 
Ferris 7:30 AM to 11:00 AM Main Line Apple Pancakes 
Scrambled Eggs Roasted Breakfast Potatoes Sliced Ham 
Turkey Sausage Vegan Station Tofu Scramble Ratatouille...
```

**Technologies used:**
- **Axios:** HTTP client for fetching the webpage
- **Cheerio:** jQuery-like library for parsing HTML (server-side)

---

### Step 4: AI Processing with OpenAI

**File:** `lib/openai.ts`

```typescript
export async function structureMenuData(
  menuText: string,
  mealType: string
): Promise<MenuData> {
  
  // 1. Construct detailed prompt
  const prompt = `
    You are a data extraction assistant. 
    Parse this menu text from Lion Dine's ${mealType} page.
    
    Extract:
    - Dining hall names
    - Operating hours
    - Stations within each hall
    - Food items at each station
    
    Return JSON with this structure:
    {
      "mealType": "...",
      "timestamp": "...",
      "diningHalls": [...]
    }
    
    Menu Text:
    ${menuText}
  `;
  
  // 2. Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a precise data extraction assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,  // Low temperature = more deterministic
    response_format: { type: 'json_object' }  // Force JSON response
  });
  
  // 3. Parse and validate response
  const content = completion.choices[0].message.content;
  const menuData = JSON.parse(content);
  
  // 4. Return structured data
  return menuData;
}
```

**Time:** ~15-35 seconds

**What happens:**
1. Sends raw text to OpenAI's GPT-4o model
2. GPT-4o understands the structure and identifies:
   - Dining hall names (Ferris, John Jay, etc.)
   - Hours (7:30 AM to 11:00 AM)
   - Status (open/closed)
   - Stations (Main Line, Vegan Station, etc.)
   - Food items under each station
3. Returns perfectly structured JSON

**Why GPT-4o?**
- Smart enough to understand context
- Can handle variations in formatting
- Identifies relationships (which items belong to which station)
- More reliable than regex/pattern matching

---

### Step 5: Return Structured JSON

**File:** `app/api/menu/route.ts`

```typescript
// Return with caching headers
return NextResponse.json(structuredData, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

**What's returned:**
```json
{
  "mealType": "breakfast",
  "timestamp": "2026-01-28T19:17:08.411Z",
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

**Cache headers:**
- `s-maxage=300` → Cache for 5 minutes
- `stale-while-revalidate=600` → Can serve stale for 10 more minutes while refreshing

---

## 📁 File Structure & Responsibilities

```
liondine/
│
├── app/
│   ├── api/
│   │   └── menu/
│   │       └── route.ts          ← Main API endpoint
│   │                               - Validates requests
│   │                               - Orchestrates scraping + AI
│   │                               - Returns JSON response
│   │
│   ├── layout.tsx                ← Root layout
│   ├── page.tsx                  ← Home page with docs
│   └── test/
│       └── page.tsx              ← Interactive test UI
│
├── lib/
│   ├── scraper.ts                ← Web scraping logic
│   │                               - Fetches HTML from liondine.com
│   │                               - Extracts text content
│   │
│   └── openai.ts                 ← AI integration
│                                   - Sends text to GPT-4o
│                                   - Structures into JSON
│
├── types/
│   └── menu.ts                   ← TypeScript type definitions
│                                   - MenuResponse
│                                   - DiningHall
│                                   - Station
│
├── .env                          ← Environment variables
│                                   - OPENAI_API_KEY
│
└── package.json                  ← Dependencies
                                    - next (framework)
                                    - openai (AI SDK)
                                    - axios (HTTP client)
                                    - cheerio (HTML parser)
```

---

## 🔑 Key Technologies

### 1. Next.js 15 (Framework)
- **Purpose:** Full-stack React framework
- **Why:** Easy API routes, TypeScript support, built-in optimization
- **File:** All files

### 2. Axios (HTTP Client)
- **Purpose:** Make HTTP requests to fetch webpages
- **Why:** More reliable than fetch, better error handling
- **File:** `lib/scraper.ts`
```typescript
const response = await axios.get(url);
```

### 3. Cheerio (HTML Parser)
- **Purpose:** Parse and extract data from HTML
- **Why:** jQuery-like syntax, fast, server-side
- **File:** `lib/scraper.ts`
```typescript
const $ = cheerio.load(response.data);
const text = $('body').text();
```

### 4. OpenAI GPT-4o (AI Model)
- **Purpose:** Transform unstructured text into structured JSON
- **Why:** Understands context, handles variations, more reliable than regex
- **File:** `lib/openai.ts`
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...]
});
```

### 5. TypeScript
- **Purpose:** Type safety
- **Why:** Catch errors at compile time, better IDE support
- **File:** All `.ts` and `.tsx` files

---

## 💡 Why This Approach?

### Alternative 1: Manual Parsing with Regex ❌
**Problem:** 
- Lion Dine HTML changes frequently
- Hard to maintain complex regex patterns
- Brittle - breaks easily

### Alternative 2: Traditional Web Scraper ❌
**Problem:**
- Need to know exact HTML structure
- Need CSS selectors or XPath
- Breaks when website updates

### Our Approach: AI-Powered Parsing ✅
**Benefits:**
- ✅ Robust to HTML changes
- ✅ Understands context (which items belong to which station)
- ✅ Handles variations in formatting
- ✅ Easy to maintain
- ✅ No need to update selectors

**Trade-off:**
- ⏱️ Slower (20-45 seconds)
- 💰 Costs ~$0.01-0.03 per request
- But: Cached for 5 minutes, so real users don't wait

---

## ⚡ Performance Characteristics

### Response Time Breakdown

```
Total Time: ~20-45 seconds

┌─────────────────────────────────────┐
│ Web Scraping: 5-10s (25%)           │ ← axios.get()
├─────────────────────────────────────┤
│ OpenAI Processing: 15-35s (75%)     │ ← openai.chat.completions.create()
├─────────────────────────────────────┤
│ JSON Validation: <1s                │
└─────────────────────────────────────┘
```

### Why So Slow?

1. **Web Scraping (5-10s):**
   - Network latency to liondine.com
   - HTML parsing with Cheerio
   
2. **OpenAI Processing (15-35s):**
   - Sending ~5-10KB of text to OpenAI
   - GPT-4o processing time
   - Network latency

### Optimization Strategies

**Current:**
- Server-side caching (5 minutes)
- Response tells clients to cache too

**Potential Improvements:**
- Add Redis cache (remember results for hours)
- Pre-fetch popular meal times
- Use faster OpenAI model (trade-off: less accurate)
- Background jobs to keep cache warm

---

## 🔐 Security & Configuration

### Environment Variables

**`.env` file:**
```
OPENAI_API_KEY=sk-proj-...
```

**Why environment variables?**
- ✅ Keep secrets out of code
- ✅ Different keys for dev/production
- ✅ Easy to rotate keys

### API Key Protection

**Server-side only:**
```typescript
// This runs on the server, never exposed to client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

Clients can't see your OpenAI API key!

---

## 🐛 Error Handling

### 1. Invalid Request
```typescript
if (!meal) {
  return NextResponse.json(
    { error: 'Missing required parameter: meal' },
    { status: 400 }
  );
}
```

### 2. Scraping Failed
```typescript
try {
  const menuText = await scrapeMenuPage(meal);
} catch (error) {
  return NextResponse.json(
    { error: 'Failed to retrieve menu data from website' },
    { status: 500 }
  );
}
```

### 3. OpenAI Failed
```typescript
try {
  const structuredData = await structureMenuData(menuText, meal);
} catch (error) {
  return NextResponse.json(
    { error: 'Failed to process menu data' },
    { status: 500 }
  );
}
```

---

## 📊 Data Flow Example

Let's trace a real request:

### 1. Request
```bash
curl "http://localhost:3000/api/menu?meal=breakfast"
```

### 2. URL Construction
```
https://liondine.com/breakfast
```

### 3. HTML Fetched
```html
<!DOCTYPE html>
<html>
  <body>
    <div>Lion Dine 🦁</div>
    <div>Ferris</div>
    <div>7:30 AM to 11:00 AM</div>
    <div>Main Line</div>
    <ul>
      <li>Apple Pancakes</li>
      <li>Scrambled Eggs</li>
    </ul>
    ...
  </body>
</html>
```

### 4. Text Extracted
```
Lion Dine 🦁 Breakfast Lunch Dinner Late Night 
Ferris 7:30 AM to 11:00 AM Main Line Apple Pancakes 
Scrambled Eggs Roasted Breakfast Potatoes...
```

### 5. Sent to OpenAI
```
Prompt: "Parse this menu text from Lion Dine's breakfast page..."
Text: "Lion Dine 🦁 Breakfast Lunch Dinner..."
```

### 6. GPT-4o Understands
- "Ferris" is a dining hall
- "7:30 AM to 11:00 AM" are hours
- "Main Line" is a station
- "Apple Pancakes" is a food item at Main Line station

### 7. JSON Returned
```json
{
  "mealType": "breakfast",
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

---

## 🎓 Key Concepts

### 1. Web Scraping
**Definition:** Extracting data from websites by parsing HTML

**How it works:**
1. Make HTTP request to website
2. Receive HTML response
3. Parse HTML structure
4. Extract desired content

### 2. HTML Parsing
**Tool:** Cheerio (jQuery for Node.js)

**Example:**
```typescript
const $ = cheerio.load(html);
const text = $('body').text();  // Get all text from body
```

### 3. AI Data Extraction
**Concept:** Use AI to understand and structure unstructured data

**Why it's powerful:**
- AI understands context
- Handles variations
- No need for rigid patterns

### 4. REST API
**Pattern:** Representational State Transfer

**Our endpoint:**
```
GET /api/menu?meal=breakfast
```
- GET = read operation
- /api/menu = resource
- ?meal=breakfast = query parameter

### 5. JSON Response
**Format:** JavaScript Object Notation

**Why JSON?**
- Universal format
- Easy to parse in any language
- Human-readable

---

## 🚀 Summary

**What this API does:**
Takes messy website HTML → Returns clean structured JSON

**How it does it:**
1. Scrapes HTML from liondine.com
2. Extracts text content
3. Uses GPT-4o to understand and structure the data
4. Returns JSON to client

**Why it's useful:**
- iOS app doesn't need to parse HTML
- Gets clean, structured menu data
- Updates automatically when website changes
- AI handles variations in formatting

**Technologies:**
- Next.js (framework)
- Axios (HTTP)
- Cheerio (HTML parsing)
- OpenAI GPT-4o (AI structuring)
- TypeScript (type safety)

**Time:** 20-45 seconds per request
**Cost:** ~$0.01-0.03 per request
**Cache:** 5 minutes

---

## 🔮 Future Enhancements

Potential improvements:

1. **Background Processing**
   - Pre-fetch menus every hour
   - Store in database
   - Instant responses

2. **Redis Caching**
   - Cache results for longer
   - Reduce API calls
   - Lower costs

3. **Webhooks**
   - Notify clients when menu changes
   - Real-time updates

4. **Historical Data**
   - Store past menus
   - Analyze trends
   - Predict what's coming

5. **More Data Points**
   - Nutritional information
   - Dietary restrictions
   - Allergen information
   - Item ratings/reviews

---

That's how it works! 🎉
