export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Lion Dine Menu API</h1>
      <p>Welcome to the Lion Dine Menu API</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li>
          <code>GET /api/menu?meal=breakfast</code>
        </li>
        <li>
          <code>GET /api/menu?meal=lunch</code>
        </li>
        <li>
          <code>GET /api/menu?meal=dinner</code>
        </li>
        <li>
          <code>GET /api/menu?meal=latenight</code>
        </li>
      </ul>

      <h2>Example Usage:</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
{`fetch('/api/menu?meal=breakfast')
  .then(res => res.json())
  .then(data => console.log(data));`}
      </pre>

      <h2>Response Format:</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`{
  "mealType": "breakfast",
  "timestamp": "2026-01-28T...",
  "diningHalls": [
    {
      "name": "Ferris",
      "hours": "7:30 AM to 11:00 AM",
      "status": "open",
      "stations": [
        {
          "name": "Main Line",
          "items": ["Apple Pancakes", "Scrambled Eggs", ...]
        }
      ]
    }
  ]
}`}
      </pre>
    </main>
  );
}
