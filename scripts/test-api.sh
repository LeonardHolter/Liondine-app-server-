#!/bin/bash

# Test script for Lion Dine Menu API
# Usage: ./scripts/test-api.sh [breakfast|lunch|dinner|latenight]

MEAL=${1:-breakfast}
API_URL="http://localhost:3000/api/menu?meal=$MEAL"

echo "=================================================="
echo "🦁 Lion Dine Menu API Test"
echo "=================================================="
echo "Testing meal type: $MEAL"
echo "URL: $API_URL"
echo ""
echo "Fetching data..."
echo ""

# Make the API call and save to temp file
RESPONSE=$(curl -s "$API_URL")

# Check if response is valid
if echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then
    echo "✅ Valid JSON response received"
    echo ""
    
    # Extract summary information
    MEAL_TYPE=$(echo "$RESPONSE" | jq -r '.mealType')
    TIMESTAMP=$(echo "$RESPONSE" | jq -r '.timestamp')
    TOTAL_HALLS=$(echo "$RESPONSE" | jq '.diningHalls | length')
    OPEN_HALLS=$(echo "$RESPONSE" | jq '[.diningHalls[] | select(.status == "open")] | length')
    CLOSED_HALLS=$(echo "$RESPONSE" | jq '[.diningHalls[] | select(.status == "closed")] | length')
    
    echo "=================================================="
    echo "📊 SUMMARY"
    echo "=================================================="
    echo "Meal Type:      $MEAL_TYPE"
    echo "Timestamp:      $TIMESTAMP"
    echo "Total Halls:    $TOTAL_HALLS"
    echo "Open Halls:     $OPEN_HALLS (🟢)"
    echo "Closed Halls:   $CLOSED_HALLS (🔴)"
    echo ""
    
    echo "=================================================="
    echo "🍽️  DINING HALLS DETAILS"
    echo "=================================================="
    echo ""
    
    # Loop through each dining hall
    echo "$RESPONSE" | jq -c '.diningHalls[]' | while read -r hall; do
        NAME=$(echo "$hall" | jq -r '.name')
        HOURS=$(echo "$hall" | jq -r '.hours')
        STATUS=$(echo "$hall" | jq -r '.status')
        STATION_COUNT=$(echo "$hall" | jq '.stations | length')
        
        if [ "$STATUS" = "open" ]; then
            STATUS_ICON="🟢"
        else
            STATUS_ICON="🔴"
        fi
        
        echo "──────────────────────────────────────────────────"
        echo "$STATUS_ICON $NAME [$STATUS]"
        if [ -n "$HOURS" ]; then
            echo "   ⏰ Hours: $HOURS"
        fi
        echo "   📍 Stations: $STATION_COUNT"
        echo ""
        
        if [ "$STATION_COUNT" -gt 0 ]; then
            echo "$hall" | jq -r '.stations[] | "   🍴 \(.name)\n      Items (\(.items | length)): \(.items | join(", "))\n"'
        else
            echo "   ℹ️  No items available"
            echo ""
        fi
    done
    
    echo "=================================================="
    echo "📄 FULL JSON RESPONSE"
    echo "=================================================="
    echo "$RESPONSE" | jq '.'
    
else
    echo "❌ Error: Invalid response or API not available"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    exit 1
fi
