import OpenAI from 'openai';
import { MenuData } from '@/types/menu';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function structureMenuData(
  menuText: string,
  mealType: string
): Promise<MenuData> {
  const prompt = `You are a data extraction assistant. Parse the following menu text from Lion Dine's ${mealType} page and structure it into JSON format.

The text contains information about multiple dining halls, each with:
- Hall name
- Operating hours (or "Closed for ${mealType}")
- Stations (e.g., "Main Line", "Vegan Station", "500 Degrees", etc.)
- Food items under each station

IMPORTANT RULES:
1. If a hall says "Closed for ${mealType}" or "No data available", set status to "closed" and include an empty stations array
2. Extract the exact hours shown (e.g., "7:30 AM to 11:00 AM")
3. Group food items by their station name
4. Preserve the exact food item names
5. The dining halls are typically: Ferris, JJ's, Faculty House, Grace Dodge, Johnny's, Fac Shack, John Jay, Hewitt, Chef Mike's, Diana, Chef Don's

Return a JSON object with this exact structure:
{
  "mealType": "${mealType}",
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

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a precise data extraction assistant. You always return valid JSON and nothing else.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const menuData = JSON.parse(content) as MenuData;
    
    // Validate the structure
    if (!menuData.diningHalls || !Array.isArray(menuData.diningHalls)) {
      throw new Error('Invalid menu data structure');
    }

    return menuData;
  } catch (error) {
    console.error('Error structuring menu data:', error);
    throw new Error(`Failed to structure menu data: ${error}`);
  }
}
