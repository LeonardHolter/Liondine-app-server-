# Lion Dine Menu API - iOS Integration Guide

## 🚀 Quick Start

### Local Development Setup

**API is running at:**
```
http://localhost:3000
```

**Base Endpoint:**
```
http://localhost:3000/api/menu
```

---

## 📡 API Endpoints

### Get Menu by Meal Type

```
GET /api/menu?meal={mealType}
```

**Query Parameters:**
- `meal` (required): `breakfast` | `lunch` | `dinner` | `latenight`

**Example Requests:**
```
GET http://localhost:3000/api/menu?meal=breakfast
GET http://localhost:3000/api/menu?meal=lunch
GET http://localhost:3000/api/menu?meal=dinner
GET http://localhost:3000/api/menu?meal=latenight
```

---

## 📦 Response Data Structure

### Root Response Object

```typescript
{
  "mealType": string,        // "breakfast" | "lunch" | "dinner" | "latenight"
  "timestamp": string,       // ISO 8601 datetime
  "diningHalls": DiningHall[]
}
```

### DiningHall Object

```typescript
{
  "name": string,           // e.g., "Ferris", "John Jay", "Hewitt"
  "hours": string,          // e.g., "7:30 AM to 11:00 AM" (empty string if closed)
  "status": string,         // "open" | "closed"
  "stations": Station[]     // Empty array if closed
}
```

### Station Object

```typescript
{
  "name": string,           // e.g., "Main Line", "Vegan Station", "500 Degrees"
  "items": string[]         // Array of food item names
}
```

---

## 📋 Complete Example Response

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
          "items": [
            "Apple Pancakes",
            "Scrambled Eggs",
            "Roasted Breakfast Potatoes",
            "Sliced Ham",
            "Turkey Sausage",
            "Biscuits and Sausage Gravy"
          ]
        },
        {
          "name": "Vegan Station",
          "items": [
            "Tofu Scramble",
            "Ratatouille",
            "Beyond Sausage"
          ]
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

---

## 🍎 Swift Integration Example

### 1. Data Models

```swift
// MARK: - Menu Response
struct MenuResponse: Codable {
    let mealType: String
    let timestamp: String
    let diningHalls: [DiningHall]
}

// MARK: - Dining Hall
struct DiningHall: Codable, Identifiable {
    let name: String
    let hours: String
    let status: String
    let stations: [Station]
    
    var id: String { name }
    var isOpen: Bool { status == "open" }
}

// MARK: - Station
struct Station: Codable, Identifiable {
    let name: String
    let items: [String]
    
    var id: String { name }
}

// MARK: - Meal Type
enum MealType: String, CaseIterable {
    case breakfast = "breakfast"
    case lunch = "lunch"
    case dinner = "dinner"
    case latenight = "latenight"
    
    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        case .latenight: return "Late Night"
        }
    }
}
```

### 2. API Service

```swift
import Foundation

class LionDineAPIService {
    // For local development
    private let baseURL = "http://localhost:3000/api"
    
    // For production (when deployed)
    // private let baseURL = "https://your-production-url.com/api"
    
    func fetchMenu(for mealType: MealType) async throws -> MenuResponse {
        guard let url = URL(string: "\(baseURL)/menu?meal=\(mealType.rawValue)") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(MenuResponse.self, from: data)
    }
}
```

### 3. SwiftUI View Example

```swift
import SwiftUI

struct MenuView: View {
    @State private var menuData: MenuResponse?
    @State private var selectedMeal: MealType = .breakfast
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    private let apiService = LionDineAPIService()
    
    var body: some View {
        NavigationView {
            VStack {
                // Meal Type Picker
                Picker("Meal Type", selection: $selectedMeal) {
                    ForEach(MealType.allCases, id: \.self) { meal in
                        Text(meal.displayName).tag(meal)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                .onChange(of: selectedMeal) { _ in
                    Task {
                        await loadMenu()
                    }
                }
                
                if isLoading {
                    ProgressView("Loading menu...")
                        .padding()
                } else if let error = errorMessage {
                    Text("Error: \(error)")
                        .foregroundColor(.red)
                        .padding()
                } else if let menu = menuData {
                    MenuListView(menu: menu)
                }
            }
            .navigationTitle("Lion Dine 🦁")
            .task {
                await loadMenu()
            }
        }
    }
    
    private func loadMenu() async {
        isLoading = true
        errorMessage = nil
        
        do {
            menuData = try await apiService.fetchMenu(for: selectedMeal)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

struct MenuListView: View {
    let menu: MenuResponse
    
    var body: some View {
        List {
            ForEach(menu.diningHalls) { hall in
                Section(header: DiningHallHeader(hall: hall)) {
                    if hall.isOpen && !hall.stations.isEmpty {
                        ForEach(hall.stations) { station in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(station.name)
                                    .font(.headline)
                                    .foregroundColor(.blue)
                                
                                ForEach(station.items, id: \.self) { item in
                                    Text("• \(item)")
                                        .font(.subheadline)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    } else {
                        Text("Closed")
                            .foregroundColor(.gray)
                            .italic()
                    }
                }
            }
        }
    }
}

struct DiningHallHeader: View {
    let hall: DiningHall
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(hall.name)
                    .font(.headline)
                Spacer()
                Circle()
                    .fill(hall.isOpen ? Color.green : Color.red)
                    .frame(width: 10, height: 10)
            }
            if !hall.hours.isEmpty {
                Text(hall.hours)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}
```

---

## 🔧 Testing Your Integration

### 1. Start the API Server
```bash
cd /Users/leonardholter/code/liondine
npm run dev
```

### 2. Test Endpoints with cURL

```bash
# Test breakfast
curl http://localhost:3000/api/menu?meal=breakfast

# Test lunch
curl http://localhost:3000/api/menu?meal=lunch

# Test dinner
curl http://localhost:3000/api/menu?meal=dinner

# Test late night
curl http://localhost:3000/api/menu?meal=latenight
```

### 3. iOS Simulator Network Access

**IMPORTANT:** When testing on iOS Simulator, use `localhost` or `127.0.0.1`:
```swift
private let baseURL = "http://localhost:3000/api"
```

**For physical iPhone devices on the same network:**
```swift
// Replace with your Mac's local IP address
private let baseURL = "http://YOUR_MAC_IP:3000/api"
```

To find your Mac's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 📊 What to Expect From the API

### Response Characteristics

| Meal Type    | Typical Halls Open | Response Time | Data Size  |
|-------------|-------------------|---------------|------------|
| Breakfast   | 5-6 halls         | ~20-40s       | ~10-15KB   |
| Lunch       | 8-10 halls        | ~25-45s       | ~15-25KB   |
| Dinner      | 8-10 halls        | ~25-45s       | ~15-25KB   |
| Late Night  | 2-4 halls         | ~15-30s       | ~5-10KB    |

### Data Patterns

**Open Dining Halls:**
- ✅ `status`: `"open"`
- ✅ `hours`: Non-empty string (e.g., "7:30 AM to 11:00 AM")
- ✅ `stations`: Array with 1+ stations
- ✅ Each station has multiple food items

**Closed Dining Halls:**
- ❌ `status`: `"closed"`
- ❌ `hours`: Empty string `""` or specific hours
- ❌ `stations`: Empty array `[]`

### Common Dining Hall Names
- Ferris
- JJ's
- Faculty House
- Grace Dodge
- Johnny's
- Fac Shack
- John Jay
- Hewitt
- Chef Mike's
- Diana
- Chef Don's

### Common Station Names
- Main Line
- Vegan Station
- Soup Station
- 500 Degrees
- Homestyle
- Flame
- Performance Kitchen
- The Sweet Shoppe
- Fuel
- Nook
- Breakfast Grill
- Oatmeal Bar
- Fresh Juiced
- Smoothie Lab
- Bowls and Blends
- Sandwiches
- Sides

---

## 🛡️ Error Handling

### Possible Error Responses

**400 Bad Request - Missing meal parameter:**
```json
{
  "error": "Missing required parameter: meal"
}
```

**400 Bad Request - Invalid meal type:**
```json
{
  "error": "Invalid meal type. Must be one of: breakfast, lunch, dinner, latenight"
}
```

**500 Server Error:**
```json
{
  "error": "Failed to process menu data",
  "details": "Error message here"
}
```

### Swift Error Handling

```swift
do {
    let menu = try await apiService.fetchMenu(for: .breakfast)
    // Success - use menu data
} catch let urlError as URLError {
    switch urlError.code {
    case .notConnectedToInternet:
        print("No internet connection")
    case .timedOut:
        print("Request timed out")
    case .cannotConnectToHost:
        print("Cannot connect to API - is server running?")
    default:
        print("Network error: \(urlError.localizedDescription)")
    }
} catch {
    print("Unexpected error: \(error)")
}
```

---

## ⚡ Performance Tips

### 1. Caching
The API caches responses for 5 minutes. Consider implementing client-side caching too:

```swift
class MenuCache {
    private var cache: [MealType: (MenuResponse, Date)] = [:]
    private let cacheLifetime: TimeInterval = 300 // 5 minutes
    
    func get(_ mealType: MealType) -> MenuResponse? {
        guard let (menu, timestamp) = cache[mealType],
              Date().timeIntervalSince(timestamp) < cacheLifetime else {
            return nil
        }
        return menu
    }
    
    func set(_ menu: MenuResponse, for mealType: MealType) {
        cache[mealType] = (menu, Date())
    }
}
```

### 2. Loading States
Show loading indicators - API takes 20-45 seconds due to:
- Web scraping (~5-10s)
- OpenAI processing (~15-35s)

### 3. Prefetching
Consider prefetching the next meal type:

```swift
// After loading breakfast, prefetch lunch
Task {
    _ = try? await apiService.fetchMenu(for: .lunch)
}
```

---

## 🌐 Production Deployment

When the API is deployed to production (Vercel, etc.), update the base URL:

```swift
class LionDineAPIService {
    #if DEBUG
    private let baseURL = "http://localhost:3000/api"
    #else
    private let baseURL = "https://your-production-url.vercel.app/api"
    #endif
}
```

---

## 📱 Info.plist Configuration

For iOS to connect to local server, add to `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

**Note:** Remove `NSAllowsArbitraryLoads` in production!

---

## 🧪 Sample Test Data

### Typical Breakfast Response Summary
```
Total Halls: 11
Open Halls: 5 (Ferris, John Jay, Hewitt, Diana, Chef Don's)
Closed Halls: 6
Total Stations (open halls): ~21
Total Food Items: ~130
```

### Example Open Hall (Hewitt)
- **Hours:** 7:30 AM to 10:00 AM
- **Stations:** 7
  - 500 Degrees (13 items)
  - Homestyle (6 items)
  - Flame (10 items)
  - Performance Kitchen (13 items)
  - The Sweet Shoppe (6 items)
  - Fuel (18 items)
  - Soup (4 items)

---

## 📞 Contact & Support

- **API Running:** `npm run dev` in `/Users/leonardholter/code/liondine`
- **API URL:** `http://localhost:3000`
- **Test UI:** `http://localhost:3000/test`
- **Documentation:** Check `README.md`, `QUICKSTART.md`, `SETUP.md`

---

## ✅ Integration Checklist

- [ ] API server is running (`npm run dev`)
- [ ] Can access `http://localhost:3000` in browser
- [ ] Tested API with cURL commands
- [ ] Created Swift data models (MenuResponse, DiningHall, Station)
- [ ] Implemented API service class
- [ ] Added Info.plist network permissions
- [ ] Implemented error handling
- [ ] Added loading states in UI
- [ ] Tested on iOS Simulator
- [ ] (Optional) Tested on physical device with Mac IP

---

## 🚀 Ready to Integrate!

The API is fully functional and returning structured menu data. All dining halls, stations, and food items are properly organized and ready for your iOS app to consume.

**Start here:**
1. Ensure API is running: `npm run dev`
2. Copy the Swift models above
3. Create the API service
4. Build your UI to display the data

Good luck with your integration! 🦁
