'use client';

import { useState } from 'react';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'latenight';

export default function TestPage() {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/menu?meal=${mealType}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch menu');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🦁 Lion Dine Menu API Test</h1>
      <p>Test the menu parsing API with different meal types.</p>

      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Select Meal Type:
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '1rem'
          }}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="latenight">Late Night</option>
        </select>

        <button
          onClick={fetchMenu}
          disabled={loading}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch Menu'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div>
          <h2>Results</h2>
          <div style={{
            backgroundColor: '#f4f4f4',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <p><strong>Meal Type:</strong> {result.mealType}</p>
            <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
            <p><strong>Dining Halls:</strong> {result.diningHalls?.length || 0}</p>
            <p><strong>Open Halls:</strong> {result.diningHalls?.filter((h: any) => h.status === 'open').length || 0}</p>
          </div>

          <h3>Dining Halls</h3>
          {result.diningHalls?.map((hall: any, idx: number) => (
            <details key={idx} style={{
              marginBottom: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '0.5rem' }}>
                {hall.name} - {hall.status === 'open' ? '🟢 Open' : '🔴 Closed'} 
                {hall.hours && ` (${hall.hours})`}
              </summary>
              <div style={{ padding: '1rem' }}>
                {hall.stations?.length > 0 ? (
                  hall.stations.map((station: any, sIdx: number) => (
                    <div key={sIdx} style={{ marginBottom: '1rem' }}>
                      <h4 style={{ marginBottom: '0.5rem', color: '#0070f3' }}>{station.name}</h4>
                      <ul style={{ marginLeft: '1rem' }}>
                        {station.items?.map((item: string, iIdx: number) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No items available</p>
                )}
              </div>
            </details>
          ))}

          <details open style={{
            marginTop: '2rem',
            backgroundColor: '#f9f9f9',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
              Raw JSON Response
            </summary>
            <pre style={{
              backgroundColor: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.85rem'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
