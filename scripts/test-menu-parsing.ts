/**
 * Test script to verify menu parsing with sample data
 * Run with: npx tsx scripts/test-menu-parsing.ts
 */

import { structureMenuData } from '../lib/openai';

// Sample menu text from Lion Dine breakfast page
const sampleBreakfastText = `
Lion Dine 🦁 

Breakfast Lunch Dinner Late Night 

⚠️ Johnny's food truck will be closed until Friday

Ferris 
7:30 AM to 11:00 AM
Main Line
Apple Pancakes
Scrambled Eggs
Roasted Breakfast Potatoes
Sliced Ham
Turkey Sausage
Biscuits and Sausage Gravy
Vegan Station
Tofu Scramble
Ratatouille
Beyond Sausage

JJ's 
12:00 AM to 10:00 AM
No data available.

Faculty House 
Closed for breakfast

Grace Dodge 
Closed for breakfast

Johnny's 
Closed for breakfast

Fac Shack 
Closed for breakfast

John Jay 
9:30 AM to 11:00 AM
Soup Station
Oatmeal
Strawberries and Cream
Grits
Main Line
Scramble Eggs
Egg White Scramble
Funfetti Pancakes
Spinach and Yellow Peppers
Breakfast Potatoes
Corned Beef
Vegan Station
Tofu Scramble
Vegan Sausage
Spinach and Yellow Peppers

Hewitt 
7:30 AM to 10:00 AM
500 Degrees
Veggie Breakfast Pizza
Breakfast Pizza
Homestyle
Waffles
Buttermilk Pancakes
Home Fries with Onions & Peppers
Turkey Bacon
Flame
Scrambled Eggs
Hard Boiled Eggs
Performance Kitchen
Scrambled Eggs
Turkey Bacon
Tofu Scramble
The Sweet Shoppe
Double Chocolate Chip Muffin
Blueberry Muffin

Chef Mike's 
Closed for breakfast

Diana 
9:00 AM to 3:00 PM
Homestyle
scrambled eggs
French Toast
Belgian Waffle
Breakfast Potatoes
Breakfast Grill
Brioche Bun
cage-free fried egg
Bacon
Turkey Bacon
Oatmeal Bar
Hard Boiled Egg
Steel Cut Oatmeal

Chef Don's 
8:00 AM to 11:00 AM
Sandwiches
Bacon egg and cheese bagel
Ham egg and cheese bagel
Vegan breakfast bagel
Sides
Cup of oatmeal
Piece of fruit
Danish pastry
Small coffee or tea
`;

async function testMenuParsing() {
  console.log('Testing menu parsing with sample breakfast data...\n');

  try {
    const result = await structureMenuData(sampleBreakfastText, 'breakfast');
    console.log('✅ Successfully parsed menu data!');
    console.log('\nStructured Output:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`- Total dining halls: ${result.diningHalls.length}`);
    console.log(`- Open halls: ${result.diningHalls.filter(h => h.status === 'open').length}`);
    console.log(`- Closed halls: ${result.diningHalls.filter(h => h.status === 'closed').length}`);
    
  } catch (error) {
    console.error('❌ Error parsing menu:', error);
    process.exit(1);
  }
}

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
  console.log('\nPlease set your OpenAI API key:');
  console.log('export OPENAI_API_KEY=your_key_here');
  process.exit(1);
}

testMenuParsing();
