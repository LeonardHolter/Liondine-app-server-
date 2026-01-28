import { NextRequest, NextResponse } from 'next/server';
import { scrapeMenuPage } from '@/lib/scraper';
import { structureMenuData } from '@/lib/openai';
import { menuCache } from '@/lib/cache';
import { MealType } from '@/types/menu';

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'latenight'];

export async function GET(request: NextRequest) {
  try {
    // Get meal type from query parameter
    const searchParams = request.nextUrl.searchParams;
    const meal = searchParams.get('meal');
    const skipCache = searchParams.get('refresh') === 'true'; // Allow cache bypass

    // Validate meal type
    if (!meal) {
      return NextResponse.json(
        { error: 'Missing required parameter: meal' },
        { status: 400 }
      );
    }

    if (!VALID_MEAL_TYPES.includes(meal as MealType)) {
      return NextResponse.json(
        { 
          error: 'Invalid meal type. Must be one of: breakfast, lunch, dinner, latenight' 
        },
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

    // Try to get from cache first (unless refresh requested)
    if (!skipCache) {
      const cachedData = menuCache.get(meal);
      if (cachedData) {
        console.log(`[API] Returning cached data for ${meal}`);
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=3600',
          },
        });
      }
    }

    // Cache miss or refresh requested - fetch fresh data
    console.log(`[API] Cache miss for ${meal} - fetching fresh data`);

    // Scrape the menu page
    console.log(`Scraping menu for: ${meal}`);
    const menuText = await scrapeMenuPage(meal);

    if (!menuText || menuText.length < 100) {
      return NextResponse.json(
        { error: 'Failed to retrieve menu data from website' },
        { status: 500 }
      );
    }

    // Structure the data using OpenAI
    console.log(`Structuring menu data using OpenAI...`);
    const structuredData = await structureMenuData(menuText, meal);

    // Store in cache for future requests
    menuCache.set(meal, structuredData);

    // Return the structured JSON
    return NextResponse.json(structuredData, {
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
