# 📱 For iOS Developer - Start Here!

## ⚡ TL;DR

**API is running at:** `http://localhost:3000/api/menu?meal={breakfast|lunch|dinner|latenight}`

**Get breakfast menu:**
```bash
curl "http://localhost:3000/api/menu?meal=breakfast"
```

**Response structure:** `MenuResponse → DiningHalls[] → Stations[] → Items[]`

**Response time:** 20-45 seconds (includes web scraping + AI processing)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `API_INTEGRATION_GUIDE.md` | **START HERE** - Complete integration guide with Swift examples |
| `QUICK_REFERENCE.md` | Quick lookup for endpoints, models, and commands |
| `sample-responses/breakfast.json` | Sample JSON for offline testing |
| `sample-responses/README.md` | How to use sample data in your app |

---

## 🚀 3-Step Quick Start

### Step 1: Verify API is Working

```bash
# Test the API
curl "http://localhost:3000/api/menu?meal=breakfast"

# Should return JSON with dining halls, stations, and food items
```

### Step 2: Copy Swift Models

Open `API_INTEGRATION_GUIDE.md` and copy the Swift models:
- `MenuResponse`
- `DiningHall` 
- `Station`
- `MealType`

### Step 3: Create API Service

Copy the `LionDineAPIService` class from `API_INTEGRATION_GUIDE.md`

---

## 📦 What You'll Get From API

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
        },
        {
          "name": "Vegan Station",
          "items": ["Tofu Scramble", "Ratatouille", ...]
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

### Key Points:
- ✅ 11 dining halls per meal
- ✅ Each open hall has 2-7 stations
- ✅ Each station has food items array
- ✅ Closed halls have empty stations array
- ✅ Status is either "open" or "closed"

---

## 🎯 API Endpoints

```
GET /api/menu?meal=breakfast   → Breakfast menu (7:30 AM - 11:00 AM)
GET /api/menu?meal=lunch        → Lunch menu (11:00 AM - 3:00 PM)
GET /api/menu?meal=dinner       → Dinner menu (4:00 PM - 8:00 PM)
GET /api/menu?meal=latenight    → Late night menu (8:00 PM - 2:00 AM)
```

---

## 💻 iOS Simulator Setup

### For Simulator (easiest):
```swift
private let baseURL = "http://localhost:3000/api"
```

### For Physical Device:
```swift
// Use your Mac's IP address
private let baseURL = "http://192.168.1.XXX:3000/api"
```

Find your Mac's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Add to Info.plist:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

---

## ⏱️ Important: Loading States

**API takes 20-45 seconds** because it:
1. Scrapes the live website (~5-10s)
2. Uses OpenAI to structure the data (~15-35s)

**You MUST show a loading indicator!**

```swift
@State private var isLoading = false

// In your view
if isLoading {
    ProgressView("Loading menu...")
        .padding()
}
```

---

## 🧪 Testing Without API

Use the sample JSON file for fast UI development:

```swift
// Load from bundle for testing
func loadSampleMenu() -> MenuResponse? {
    guard let url = Bundle.main.url(forResource: "breakfast", withExtension: "json"),
          let data = try? Data(contentsOf: url) else {
        return nil
    }
    return try? JSONDecoder().decode(MenuResponse.self, from: data)
}
```

See `sample-responses/README.md` for details.

---

## 📊 Current Test Data (Breakfast)

Real data from the API right now:

- **Total Halls:** 11
- **Open Halls:** 5 (Ferris, John Jay, Hewitt, Diana, Chef Don's)
- **Closed Halls:** 6 
- **Total Stations:** ~21 (in open halls)
- **Total Food Items:** ~130

### Example Open Hall - Hewitt:
```
Hours: 7:30 AM to 10:00 AM
Stations:
  • 500 Degrees (13 items)
  • Homestyle (6 items)
  • Flame (10 items)
  • Performance Kitchen (13 items)
  • The Sweet Shoppe (6 items)
  • Fuel (18 items)
  • Soup (4 items)
```

---

## 🔍 Common Dining Halls

You'll see these halls consistently across all meals:
- Ferris
- John Jay
- Hewitt
- JJ's
- Faculty House
- Grace Dodge
- Johnny's
- Fac Shack
- Chef Mike's
- Diana
- Chef Don's

---

## 🔍 Common Station Names

Plan your UI around these station types:
- Main Line (most common)
- Vegan Station
- Soup Station
- 500 Degrees (pizza)
- Homestyle
- Flame (eggs/omelets)
- The Sweet Shoppe (desserts)
- Fuel (salads)
- Smoothie Lab
- Breakfast Grill
- Performance Kitchen

---

## ❌ Error Handling

### API Errors

```json
// Missing meal parameter
{
  "error": "Missing required parameter: meal"
}

// Invalid meal type
{
  "error": "Invalid meal type. Must be one of: breakfast, lunch, dinner, latenight"
}
```

### Swift Error Handling

```swift
do {
    let menu = try await apiService.fetchMenu(for: .breakfast)
    // Success
} catch let error as URLError {
    switch error.code {
    case .notConnectedToInternet:
        showError("No internet connection")
    case .cannotConnectToHost:
        showError("Cannot connect to API. Is the server running?")
    case .timedOut:
        showError("Request timed out. Menu data is loading (takes 20-45s)")
    default:
        showError("Network error: \(error.localizedDescription)")
    }
} catch {
    showError("Unexpected error: \(error)")
}
```

---

## 🎨 UI Suggestions

### Recommended Layout:
1. **Meal Type Picker** (Segmented Control) - breakfast, lunch, dinner, late night
2. **List of Dining Halls** - Section per hall
3. **Hall Header** - Name, status indicator (🟢/🔴), hours
4. **Stations** - Subsections within each hall
5. **Food Items** - Bulleted list under each station

### Status Indicators:
```swift
Circle()
    .fill(hall.isOpen ? Color.green : Color.red)
    .frame(width: 10, height: 10)
```

### Filter Options (optional):
- Show only open halls
- Filter by dietary preference (vegan stations)
- Search food items

---

## 📱 Production Considerations

### Before App Store:

1. **Remove localhost** - API needs to be deployed
2. **Update Info.plist** - Remove `NSAllowsArbitraryLoads`
3. **Add caching** - Cache menu data client-side
4. **Add refresh** - Pull-to-refresh for latest data
5. **Offline mode** - Show cached data when offline

### Deployment:
- API can be deployed to Vercel, Netlify, etc.
- Update baseURL to production URL
- Use environment-based configuration

---

## ✅ Integration Checklist

Before you start coding:
- [ ] API is running (`npm run dev` in the API folder)
- [ ] Can access http://localhost:3000 in browser
- [ ] Tested API with cURL and got valid JSON
- [ ] Read `API_INTEGRATION_GUIDE.md`

While coding:
- [ ] Created Swift data models
- [ ] Created API service class  
- [ ] Added Info.plist network permissions
- [ ] Implemented loading states (20-45s response time!)
- [ ] Added error handling
- [ ] Tested on iOS Simulator

Before testing on device:
- [ ] Found Mac's IP address
- [ ] Updated baseURL with Mac's IP
- [ ] Ensured Mac and iPhone on same WiFi

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | API not running - run `npm run dev` in API folder |
| "Timeout" | Normal - increase timeout to 60s, API takes 20-45s |
| Simulator can't connect | Use `localhost:3000` not IP address |
| Device can't connect | Use Mac's IP, ensure same WiFi network |
| Empty/no data | Check API logs for errors, try different meal type |
| Can't decode JSON | Print response data to debug, check model structure |

---

## 📞 Need Help?

1. Check `API_INTEGRATION_GUIDE.md` for detailed examples
2. Check `QUICK_REFERENCE.md` for quick answers
3. Test API manually with cURL to verify it's working
4. Check API terminal logs for errors

---

## 🎉 You're Ready!

The API is fully functional and returning real menu data from liondine.com. All you need to do is:

1. Copy the Swift models
2. Create the API service
3. Build your UI
4. Handle the ~30 second loading time

**The hardest part (API + data structuring) is done!** 🚀

Good luck building the app! 🦁
