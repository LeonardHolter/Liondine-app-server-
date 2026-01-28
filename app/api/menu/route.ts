import { NextRequest, NextResponse } from 'next/server';
import { MealType, MenuData } from '@/types/menu';

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'latenight'];

// In-memory cache (simple version to avoid import issues)
const cache: Map<string, { data: MenuData; timestamp: number }> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(mealType: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${mealType}_${today}`;
}

function getFromCache(mealType: string): MenuData | null {
  const key = getCacheKey(mealType);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    console.log(`[Cache] HIT - Returning cached ${mealType}`);
    return entry.data;
  }
  console.log(`[Cache] MISS - No valid cache for ${mealType}`);
  return null;
}

function setCache(mealType: string, data: MenuData): void {
  const key = getCacheKey(mealType);
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`[Cache] STORED - Cached ${mealType}`);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const meal = searchParams.get('meal');
    const skipCache = searchParams.get('refresh') === 'true';

    // Validate meal type
    if (!meal) {
      return NextResponse.json(
        { error: 'Missing required parameter: meal' },
        { status: 400 }
      );
    }

    if (!VALID_MEAL_TYPES.includes(meal as MealType)) {
      return NextResponse.json(
        { error: 'Invalid meal type. Must be one of: breakfast, lunch, dinner, latenight' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Try cache first
    if (!skipCache) {
      const cachedData = getFromCache(meal);
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=3600',
          },
        });
      }
    }

    console.log(`[API] Fetching fresh data for ${meal}`);

    // Dynamic imports to avoid build-time analysis
    const [{ default: axios }, cheerio, { default: OpenAI }] = await Promise.all([
      import('axios'),
      import('cheerio'),
      import('openai'),
    ]);

    // Scrape menu
    const url = `https://liondine.com/${meal}`;
    console.log(`[Scraper] Fetching ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    $('script, style').remove();
    const menuText = $('body').text().replace(/\s+/g, ' ').trim();

    if (!menuText || menuText.length < 100) {
      return NextResponse.json(
        { error: 'Failed to retrieve menu data from website' },
        { status: 500 }
      );
    }

    // Structure with OpenAI
    console.log(`[OpenAI] Structuring data...`);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a data extraction assistant. Parse the following menu text from Lion Dine's ${meal} page and structure it into JSON format.

The text contains information about multiple dining halls, each with:
- Hall name
- Operating hours (or "Closed for ${meal}")
- Stations (e.g., "Main Line", "Vegan Station", "500 Degrees", etc.)
- Food items under each station

IMPORTANT RULES:
1. If a hall says "Closed for ${meal}" or "No data available", set status to "closed" and include an empty stations array
2. Extract the exact hours shown (e.g., "7:30 AM to 11:00 AM")
3. Group food items by their station name
4. Preserve the exact food item names
5. The dining halls are typically: Ferris, JJ's, Faculty House, Grace Dodge, Johnny's, Fac Shack, John Jay, Hewitt, Chef Mike's, Diana, Chef Don's

Return a JSON object with this exact structure:
{
  "mealType": "${meal}",
  "timestamp": "${new Date().toISOString()}",
  "diningHalls": [
    {
      "name": "Dining Hall Name",
      "hours": "X:XX AM to XX:XX AM",
      "status": "open" or "closed",
      "stations": [
        {
          "name": "Station Name",
          "items": ["item1", "item2", ...]
        }
      ]
    }
  ]
}

Menu Text:
${menuText}

Return ONLY the JSON object, no additional text or explanation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a precise data extraction assistant. You always return valid JSON and nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const menuData = JSON.parse(content) as MenuData;

    if (!menuData.diningHalls || !Array.isArray(menuData.diningHalls)) {
      throw new Error('Invalid menu data structure');
    }

    // Cache the result
    setCache(meal, menuData);

    return NextResponse.json(menuData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error processing menu request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process menu data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
