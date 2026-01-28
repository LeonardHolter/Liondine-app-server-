# Sample API Responses

This folder contains sample JSON responses for testing your iOS app without hitting the live API.

## Usage

### In Xcode

1. Add the JSON file to your Xcode project
2. Load it for testing:

```swift
func loadSampleMenu() -> MenuResponse? {
    guard let url = Bundle.main.url(forResource: "breakfast", withExtension: "json"),
          let data = try? Data(contentsOf: url) else {
        return nil
    }
    return try? JSONDecoder().decode(MenuResponse.self, from: data)
}
```

### SwiftUI Preview with Sample Data

```swift
struct MenuView_Previews: PreviewProvider {
    static var previews: some View {
        if let sampleMenu = loadSampleMenu() {
            MenuListView(menu: sampleMenu)
        }
    }
}
```

### Testing Mode Toggle

```swift
class LionDineAPIService {
    var useSampleData = false // Toggle for testing
    
    func fetchMenu(for mealType: MealType) async throws -> MenuResponse {
        if useSampleData {
            return loadSampleMenu()!
        }
        
        // Real API call
        let url = URL(string: "\(baseURL)/menu?meal=\(mealType.rawValue)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(MenuResponse.self, from: data)
    }
}
```

## Files

- `breakfast.json` - Sample breakfast menu data with 7 dining halls (5 open, 2 closed)

## Benefits

- ✅ Fast UI development without waiting for API
- ✅ Work offline
- ✅ Consistent test data
- ✅ No API costs during development
- ✅ Perfect for SwiftUI previews
