import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; // Will be empty in development (using proxy)

const TeamScoresChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('Boston');

  const teams = ['Boston', 'Los Angeles', 'Chicago', 'Miami', 'Phoenix'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${API_BASE_URL}/team-last-10-games/${selectedTeam}`;
      console.log('Fetching from:', apiUrl);

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const jsonData = await response.json();
        
        // Validate the response data structure
        if (typeof jsonData !== 'object' || jsonData === null) {
          throw new Error('Invalid response format: Expected an object');
        }

        const dates = Object.keys(jsonData);
        const points = Object.values(jsonData);
        
        if (dates.length === 0) {
          throw new Error('No data available for this team');
        }

        setData({
          dates: dates.reverse(),
          points: points.reverse()
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTeam]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Last 10 Games Scoring History</h2>
        <div className="flex gap-2 flex-wrap mb-6">
          {teams.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`px-4 py-2 rounded-md min-w-20 transition-colors ${
                selectedTeam === team
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
        {data && (
          <Plot
            data={[
              {
                x: data.dates,
                y: data.points,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: '#2563eb' },
                line: { color: '#2563eb' },
              },
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 40, l: 40 },
              xaxis: {
                title: 'Game Date',
                tickangle: -45,
              },
              yaxis: {
                title: 'Points Scored',
                zeroline: false,
              },
              height: 400,
            }}
            config={{
              responsive: true,
              displayModeBar: false,
            }}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export default TeamScoresChart;