import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Scoreboard = ({ onGameSelect, onTeamSelect}) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const client = axios.create({baseURL: "http://localhost:8000"});

    const getCityName = (teamName) => {
        const specialCases = {
            'Los Angeles Lakers': 'Los Angeles Lakers',
            'Los Angeles Clippers': 'Los Angeles Clippers',
            'Golden State': 'Golden State',
            'New York': 'New York',
            'New Orleans': 'New Orleans',
            'San Antonio': 'San Antonio',
            'Oklahoma City': 'Oklahoma City'
        };
        // Check for special cases first
        for (const [fullName, cityName] of Object.entries(specialCases)) {
            if (teamName.includes(fullName)) {
                return cityName;
            }
        }
        // Default case: return first word (city name)
        return teamName.split(' ')[0];
    };

    const processTeamName = (teamName) => {
        // Check if the teamName exists in specialCases
          const specialCases = {
          'LA Lakers': 'Los Angeles Lakers',
          'Golden State': 'Golden State',
          'New York': 'New York',
          'New Orleans': 'New Orleans',
          'San Antonio': 'San Antonio',
          'Oklahoma City': 'Oklahoma City',
          'LA Clippers': 'Los Angeles Clippers' 
          };
        if (specialCases[teamName]) {
            return specialCases[teamName];
        }
        // Return the original teamName if no mapping is found
        return teamName;
      };

    useEffect(() => {

        const fetchScoreboard = async () => {
            setLoading(true);
            try {
                let response = await client.get(`/scoreboard`);
    
                const games = Object.keys(response.data);

                
                const homeTeam = games.map(game => response.data[game].home_team);
                const awayTeam = games.map(game => response.data[game].away_team);

                setData({ games, homeTeam , awayTeam });
            } catch (error) {
                console.error('API Error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchScoreboard();
    }, []);

     // Handle game click
    const handleGameClick = (homeTeam, awayTeam) => {
      if (typeof onGameSelect === 'function') {
          onGameSelect(processTeamName(homeTeam), processTeamName(awayTeam));
      } else {
          console.error("onGameSelect is not a function");
      }
  };

    // Handle team click
    const handleTeamClick = (teamName) => {
        const cityName = getCityName(teamName);
        onTeamSelect(cityName);
       
    };

    return (
      <div className="relative">
          <div className="scrollmenu mb-4">
              {loading && <p className="text-white">Loading...</p>}
              {error && <p className="text-red-500">Error: {error.message}</p>}
              {data &&
                  data.games.map((game, index) => (
                      <div
                          key={game}
                          className="game-card cursor-pointer"
                          onClick={() =>
                              handleGameClick(data.homeTeam[index], data.awayTeam[index])
                          }
                      >
                          <div className="teams">
                              <span
                                  onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering game-card click
                                      handleTeamClick(data.awayTeam[index]);
                                  }}
                                  className="cursor-pointer hover:text-blue-500 transition-colors"
                              >
                                  {data.awayTeam[index]}
                              </span>
                              {' @ '}
                              <span
                                  onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering game-card click
                                      handleTeamClick(data.homeTeam[index]);
                                  }}
                                  className="cursor-pointer hover:text-blue-500 transition-colors"
                              >
                                  {data.homeTeam[index]}
                              </span>
                          </div>
                      </div>
                  ))}
          </div>
      </div>
  );
};

export default Scoreboard;