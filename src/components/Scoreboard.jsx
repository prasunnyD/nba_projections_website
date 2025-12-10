import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../utils/apiConfig';
import { getTeamLogoUrl } from '../helpers/teamLogoUtils';
const Scoreboard = ({ onGameSelect, onTeamSelect}) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null); // Track selected game
    const [moneylineData, setMoneylineData] = useState({}); // Store moneyline data for each team
    // const client = axios.create({baseURL: "https://api.sharpr-analytics.com"});
    const client = api;
    const processTeamName = (city, team) => {
        // Combine city and team name for API calls
        // Handle special cases
        if (city === 'LA' && team === 'Lakers') {
            return 'Los Angeles Lakers';
        }
        if (city === 'LA' && team === 'Clippers') {
            return 'Los Angeles Clippers';
        }
        // Return city + team name
        return `${city} ${team}`;
    };

    const getCityForTeamsDropdown = (city, team) => {
        // Convert API city+team to TeamsDropdown city format
        // TeamsDropdown's nbaTeams array uses 'city' field which is:
        // - For LA teams: "Los Angeles Lakers" or "Los Angeles Clippers"
        // - For most other teams: just the city name (e.g., "Brooklyn", "Boston")
        // Handle special cases
        if (city === 'LA' && team === 'Lakers') {
            return 'Los Angeles Lakers';
        }
        if (city === 'LA' && team === 'Clippers') {
            return 'Los Angeles Clippers';
        }
        // For most teams, return just the city to match TeamsDropdown format
        // TeamsDropdown uses city names like "Brooklyn", "Boston", etc. in its nbaTeams array
        return city;
    };

    const getCityForLogo = (city, team) => {
        // Convert API city+team to format needed for logo utility
        // Handle special cases
        if (city === 'LA' && team === 'Lakers') {
            return 'Los Angeles Lakers';
        }
        if (city === 'LA' && team === 'Clippers') {
            return 'Los Angeles Clippers';
        }
        // For most teams, return just the city name
        return city;
    };


    // Helper function to get highest price from moneyline response
    const getHighestPrice = (moneylineResponse) => {
        if (!moneylineResponse || moneylineResponse.length === 0) {
            return null;
        }
        // Convert prices to numbers and find the highest
        const highest = moneylineResponse.reduce((max, item) => {
            const price = parseInt(item.Price, 10);
            const maxPrice = parseInt(max.Price, 10);
            return price > maxPrice ? item : max;
        });
        return {
            price: highest.Price,
            sportsbook: highest.sportbook
        };
    };

    // Fetch moneyline data for a team
    const fetchMoneyline = async (teamName) => {
        try {
            const encodedTeamName = encodeURIComponent(teamName);
            const response = await client.get(`nba/odds/moneyline/${encodedTeamName}`);
            const highestPrice = getHighestPrice(response.data);
            return highestPrice;
        } catch (error) {
            console.error(`Failed to fetch moneyline for ${teamName}:`, error);
            return null;
        }
    };

    useEffect(() => {

        const fetchScoreboard = async () => {
            setLoading(true);
            try {
                let response = await client.get(`nba/scoreboard`);
                const games = Object.keys(response.data);
                const homeCity = games.map(game => response.data[game].home_city);
                const homeTeam = games.map(game => response.data[game].home_team);
                const awayCity = games.map(game => response.data[game].away_city);
                const awayTeam = games.map(game => response.data[game].away_team);
                setData({ games, homeCity, homeTeam, awayCity, awayTeam });

                // Fetch moneyline data for all teams
                const moneylinePromises = [];
                const teamMoneylineMap = {};

                games.forEach((game, index) => {
                    const fullHomeTeam = processTeamName(homeCity[index], homeTeam[index]);
                    const fullAwayTeam = processTeamName(awayCity[index], awayTeam[index]);
                    
                    // Fetch moneyline for home team
                    moneylinePromises.push(
                        fetchMoneyline(fullHomeTeam).then(result => {
                            if (result) {
                                teamMoneylineMap[fullHomeTeam] = result;
                            }
                        })
                    );

                    // Fetch moneyline for away team
                    moneylinePromises.push(
                        fetchMoneyline(fullAwayTeam).then(result => {
                            if (result) {
                                teamMoneylineMap[fullAwayTeam] = result;
                            }
                        })
                    );
                });

                // Wait for all moneyline requests to complete
                await Promise.all(moneylinePromises);
                setMoneylineData(teamMoneylineMap);
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
    const handleGameClick = (homeCity, homeTeam, awayCity, awayTeam) => {
      if (typeof onGameSelect === 'function') {
          const fullHomeTeam = processTeamName(homeCity, homeTeam);
          const fullAwayTeam = processTeamName(awayCity, awayTeam);
          setSelectedGame(`${fullAwayTeam} vs ${fullHomeTeam}`); // Update selected game
          onGameSelect(fullHomeTeam, fullAwayTeam);
      } else {
          console.error("onGameSelect is not a function");
      }
  };

    // Auto-select first game when data loads
    useEffect(() => {
        if (data && data.games.length > 0 && !selectedGame) {
            const firstHomeCity = data.homeCity[0];
            const firstHomeTeam = data.homeTeam[0];
            const firstAwayCity = data.awayCity[0];
            const firstAwayTeam = data.awayTeam[0];
            if (typeof onGameSelect === 'function') {
                const fullHomeTeam = processTeamName(firstHomeCity, firstHomeTeam);
                const fullAwayTeam = processTeamName(firstAwayCity, firstAwayTeam);
                // Pass city for TeamsDropdown (homeTeam) and full team name for opponent (awayTeam)
                const homeCityForDropdown = getCityForTeamsDropdown(firstHomeCity, firstHomeTeam);
                setSelectedGame(`${fullAwayTeam} vs ${fullHomeTeam}`);
                onGameSelect(homeCityForDropdown, fullAwayTeam);
            }
        }
    }, [data, selectedGame, onGameSelect]);

    // Handle team click
    const handleTeamClick = (city, team) => {
        const fullTeamName = processTeamName(city, team);
        onTeamSelect(fullTeamName);
    };

    return (
      <div className="relative">
          <div className="scrollmenu mb-2 md:mb-4">
              {loading && <p className="text-white text-sm md:text-base">Loading...</p>}
              {error && <p className="text-red-500 text-sm md:text-base">Error: {error.message}</p>}
              {data &&
                  data.games.map((game, index) => {
                      const fullHomeTeam = processTeamName(data.homeCity[index], data.homeTeam[index]);
                      const fullAwayTeam = processTeamName(data.awayCity[index], data.awayTeam[index]);
                      return (
                          <div
                              key={game}
                              className={`game-card ${
                                selectedGame === `${fullAwayTeam} vs ${fullHomeTeam}`
                                    ? 'selected'
                                    : ''
                            }`}
                              onClick={() =>
                                  handleGameClick(data.homeCity[index], data.homeTeam[index], data.awayCity[index], data.awayTeam[index])
                              }
                          >
                              <div className="teams flex items-center gap-1 md:gap-2 flex-wrap">
                                  <div className="flex flex-col">
                                      <span
                                          onClick={(e) => {
                                              e.stopPropagation(); // Prevent triggering game-card click
                                              handleTeamClick(data.awayCity[index], data.awayTeam[index]);
                                          }}
                                          className="cursor-pointer hover:text-blue-500 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                                      >
                                          {(() => {
                                              const logoUrl = getTeamLogoUrl(getCityForLogo(data.awayCity[index], data.awayTeam[index]), 'L');
                                              return logoUrl ? (
                                                  <img 
                                                      src={logoUrl} 
                                                      alt={`${data.awayCity[index]} ${data.awayTeam[index]} logo`}
                                                      className="w-4 h-4 md:w-6 md:h-6 object-contain flex-shrink-0"
                                                      onError={(e) => {
                                                          e.target.style.display = 'none';
                                                      }}
                                                  />
                                              ) : null;
                                          })()}
                                          <span className="font-semibold text-blue-300">{data.awayCity[index]}</span> <span className="text-gray-300">{data.awayTeam[index]}</span>
                                      </span>
                                      {(() => {
                                          const teamMoneyline = moneylineData[fullAwayTeam];
                                          return teamMoneyline ? (
                                              <span className="text-xs md:text-sm text-green-400 ml-4 md:ml-8">
                                                  Moneyline: {teamMoneyline.price} ({teamMoneyline.sportsbook})
                                              </span>
                                          ) : null;
                                      })()}
                                  </div>
                                  <span className="text-xs md:text-sm">@</span>
                                  <div className="flex flex-col">
                                      <span
                                          onClick={(e) => {
                                              e.stopPropagation(); // Prevent triggering game-card click
                                              handleTeamClick(data.homeCity[index], data.homeTeam[index]);
                                          }}
                                          className="cursor-pointer hover:text-blue-500 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                                      >
                                          {(() => {
                                              const logoUrl = getTeamLogoUrl(getCityForLogo(data.homeCity[index], data.homeTeam[index]), 'L');
                                              return logoUrl ? (
                                                  <img 
                                                      src={logoUrl} 
                                                      alt={`${data.homeCity[index]} ${data.homeTeam[index]} logo`}
                                                      className="w-4 h-4 md:w-6 md:h-6 object-contain flex-shrink-0"
                                                      onError={(e) => {
                                                          e.target.style.display = 'none';
                                                      }}
                                                  />
                                              ) : null;
                                          })()}
                                          <span className="font-semibold text-blue-300">{data.homeCity[index]}</span> <span className="text-gray-300">{data.homeTeam[index]}</span>
                                      </span>
                                      {(() => {
                                          const teamMoneyline = moneylineData[fullHomeTeam];
                                          return teamMoneyline ? (
                                              <span className="text-xs md:text-sm text-green-400 ml-4 md:ml-8">
                                                  Moneyline: {teamMoneyline.price} ({teamMoneyline.sportsbook})
                                              </span>
                                          ) : null;
                                      })()}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
          </div>
      </div>
  );
};

export default Scoreboard;