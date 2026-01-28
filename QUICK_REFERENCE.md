# Lion Dine API - Quick Reference Card

## 🔗 Endpoints

```
Local:      http://localhost:3000/api/menu?meal={mealType}
Production: https://your-url.com/api/menu?meal={mealType}

Meal Types: breakfast | lunch | dinner | latenight
```

## 📦 JSON Structure (3 Levels)

```
MenuResponse
├── mealType: string
├── timestamp: string
└── diningHalls: []
    ├── name: string
    ├── hours: string
    ├── status: "open" | "closed"
    └── stations: []
        ├── name: string
        └── items: string[]
```

## 🍎 Copy-Paste Swift Models

```swift
struct MenuResponse: Codable {
    let mealType: String
    let timestamp: String
    let diningHalls: [DiningHall]
}

struct DiningHall: Codable, Identifiable {
    let name: String
    let hours: String
    let status: String
    let stations: [Station]
    var id: String { name }
    var isOpen: Bool { status == "open" }
}

struct Station: Codable, Identifiable {
    let name: String
    let items: [String]
    var id: String { name }
}

enum MealType: String, CaseIterable {
    case breakfast, lunch, dinner, latenight
}
```

## 🔧 Copy-Paste API Service

```swift
class LionDineAPIService {
    private let baseURL = "http://localhost:3000/api"
    
    func fetchMenu(for mealType: MealType) async throws -> MenuResponse {
        let url = URL(string: "\(baseURL)/menu?meal=\(mealType.rawValue)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(MenuResponse.self, from: data)
    }
}
```

## 📱 Info.plist (for localhost access)

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

## 🧪 Test Commands

```bash
# Start API
cd /Users/leonardholter/code/liondine && npm run dev

# Test breakfast
curl http://localhost:3000/api/menu?meal=breakfast

# Find Mac IP (for physical device)
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## ⏱️ Expected Behavior

- **Response Time:** 20-45 seconds (includes web scraping + AI processing)
- **Data Size:** 5-25KB depending on meal type
- **Cache:** 5 minutes server-side
- **Status Codes:** 200 (success), 400 (bad request), 500 (server error)

## 🎯 Key Data Points

### Breakfast (Current Test Data)
- 11 total halls
- 5 open, 6 closed
- ~21 stations (open halls)
- ~130 food items

### Open vs Closed Halls
```swift
// Open hall example
{
  "name": "Ferris",
  "hours": "7:30 AM to 11:00 AM",
  "status": "open",
  "stations": [/* has data */]
}

// Closed hall example
{
  "name": "Faculty House",
  "hours": "",
  "status": "closed",
  "stations": []
}
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | API not running - run `npm run dev` |
| Timeout | Normal - API takes 20-45s, increase timeout |
| Empty response | Check API logs, may need to refresh |
| Simulator can't connect | Use `localhost` not Mac IP |
| Device can't connect | Use Mac's IP address |

---

**Full docs:** `API_INTEGRATION_GUIDE.md`
