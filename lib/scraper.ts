import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeMenuPage(mealType: string): Promise<string> {
  try {
    const url = `https://liondine.com/${mealType}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style').remove();
    
    // Get the main content text
    const bodyText = $('body').text();
    
    // Clean up the text: remove extra whitespace
    const cleanedText = bodyText
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanedText;
  } catch (error) {
    console.error('Error scraping menu page:', error);
    throw new Error(`Failed to scrape menu page: ${error}`);
  }
}

export function extractMenuText(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script, style, nav, header, footer').remove();
  
  // Get text content
  const text = $('body').text();
  
  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}
