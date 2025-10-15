import React, { useState, useEffect } from 'react';
import { api } from "../utils/apiConfig";
import SeasonDropdown from "./SeasonDropdown";
import OpponentDropdown from "./OpponentDropdown";

export default function QBPassChart({ playerName }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("2025");
  const [opponent, setOpponent] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredPass, setHoveredPass] = useState(null);

  useEffect(() => {
    if (!playerName) {
      setSeasons([]); setSeason(""); setOpponent(""); setAllPasses(null);
      return;
    }
    // Predefined list of seasons from 2024-25 to 2020-21
    const predefinedSeasons = ["2025", "2024", "2023", "2022", "2021"];
    setSeasons(predefinedSeasons);
    // default to most recent
    setSeason(predefinedSeasons[0]);
    setOpponent(""); // Reset opponent when player changes
  }, [playerName]);

  useEffect(() => {
    if (!playerName || !season) return;
    
    setLoading(true);
    setError(null);
    const shortName = playerName.split(' ').map((name, index) => 
        index === 0 ? name[0] + '.' : name
      ).join('');
    api.get(`/nfl/players/${encodeURIComponent(shortName)}/passing-pbp-stats/${encodeURIComponent(season)}`)
      .then(res => {
        const responseData = res.data?.stats ?? [];
        setData(responseData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching QB pass data:', err);
        setError('Failed to load pass data');
        setLoading(false);
      });
  }, [playerName, season]);

  // Filter passes by opponent
  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    if (!opponent) {
      // Show all passes if no opponent selected
      setFilteredData(data);
    } else {
      // Filter passes by selected opponent
      const filteredPasses = data.filter(pass => pass.opponent === opponent);
      setFilteredData(filteredPasses);
    }
  }, [data, opponent]);

  // Calculate position on field
  const getPosition = (pass, index) => {
    // Calculate dynamic field height based on actual pass data
    const airYards = filteredData.map(p => p.air_yards);
    const maxYards = Math.max(...airYards) + 5; // Add 5 yards buffer
    const minYards = Math.min(...airYards) - 5; // Add 5 yards buffer
    const yardRange = maxYards - minYards;
    const normalizedY = Math.min(Math.max((pass.air_yards - minYards) / yardRange, 0), 1);
    
    // X position based on location with some jitter to show overlapping passes
    let xBase;
    if (pass.pass_location === 'left') xBase = 25;
    else if (pass.pass_location === 'middle') xBase = 50;
    else xBase = 75;
    
    // Add small random offset to avoid complete overlap
    const jitter = (index * 7) % 10 - 5;
    const x = xBase + jitter;
    
    // Y is inverted (0 at top, 100 at bottom on screen)
    const y = 100 - (normalizedY * 100);
    
    return { x, y };
  };

  const stats = {
    completions: filteredData.filter(d => d.complete_pass === 1.0).length,
    incompletions: filteredData.filter(d => d.complete_pass === 0.0 && d.interception === 0.0).length,
    interceptions: filteredData.filter(d => d.interception === 1.0).length,
    attempts: filteredData.length,
    avgAirYards: filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + d.air_yards, 0) / filteredData.length).toFixed(1) : '0.0'
  };

  const getPassType = (pass) => {
    if (pass.interception === 1.0) return 'interception';
    if (pass.complete_pass === 1.0) return 'complete';
    return 'incomplete';
  };

  // Always show the main layout with controls

  return (

    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">QB Pass Chart</h1>
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <SeasonDropdown
            predefinedSeasons={seasons}
            playerName={playerName}
            value={season}
            onChange={setSeason}
          />
          <OpponentDropdown
            data={data}
            value={opponent}
            onChange={setOpponent}
          />
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading pass data...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">Error loading data</p>
            <p className="text-slate-300">{error}</p>
          </div>
        )}
        
        {/* No Data State */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-6xl mb-4">📊</div>
            <p className="text-white text-lg mb-2">No pass data found</p>
            <p className="text-slate-300">
              {data.length === 0 
                ? `No passing plays found for ${playerName} in ${season}`
                : `No passing plays found for ${playerName} against ${opponent} in ${season}`
              }
            </p>
          </div>
        )}
        
        {/* Stats bar - Only show when we have data */}
        {!loading && !error && filteredData.length > 0 && (
        <div className="bg-slate-800/80 backdrop-blur rounded-lg p-4 mb-6 grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-slate-400 text-sm">Completion %</div>
            <div className="text-white text-2xl font-bold">
              {((stats.completions / stats.attempts) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Attempts</div>
            <div className="text-blue-400 text-2xl font-bold">{stats.attempts}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Completions</div>
            <div className="text-blue-400 text-2xl font-bold">{stats.completions}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Interceptions</div>
            <div className="text-red-400 text-2xl font-bold">{stats.interceptions}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Avg Air Yards</div>
            <div className="text-white text-2xl font-bold">{stats.avgAirYards}</div>
          </div>
        </div>
        )}

        {/* Football Field - Only show when we have data */}
        {!loading && !error && filteredData.length > 0 && (
        <div className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Field markings */}
          <svg className="w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Yard lines */}
            {(() => {
              const airYards = filteredData.map(p => p.air_yards);
              const maxYards = Math.max(...airYards) + 5;
              const minYards = Math.min(...airYards) - 5;
              const yardRange = maxYards - minYards;
              
              // Generate standard 5-yard interval yard lines
              const yardLines = [];
              const startYard = Math.ceil(minYards / 5) * 5; // Round up to nearest 5
              const endYard = Math.floor(maxYards / 5) * 5; // Round down to nearest 5
              
              for (let yard = startYard; yard <= endYard; yard += 5) {
                yardLines.push(yard);
              }
              
              return yardLines.map(yard => {
                const normalizedY = (yard - minYards) / yardRange;
                const y = 100 - (normalizedY * 100);
                return (
                  <g key={yard}>
                    <line 
                      x1="0" 
                      y1={y} 
                      x2="100" 
                      y2={y} 
                      stroke="white" 
                      strokeWidth="0.3" 
                      opacity="0.4"
                    />
                    <text 
                      x="5" 
                      y={y - 1} 
                      fill="white" 
                      fontSize="3" 
                      opacity="0.6"
                    >
                      {yard}
                    </text>
                    <text 
                      x="92" 
                      y={y - 1} 
                      fill="white" 
                      fontSize="3" 
                      opacity="0.6"
                    >
                      {yard}
                    </text>
                  </g>
                );
              });
            })()}
            
            {/* Hash marks */}
            <line x1="35" y1="0" x2="35" y2="100" stroke="white" strokeWidth="0.2" opacity="0.3" strokeDasharray="1,2" />
            <line x1="65" y1="0" x2="65" y2="100" stroke="white" strokeWidth="0.2" opacity="0.3" strokeDasharray="1,2" />
            
            {/* Sidelines */}
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="0.5" />
            
            {/* Line of scrimmage (QB position) at 0 yard line */}
            {(() => {
              const airYards = filteredData.map(p => p.air_yards);
              const maxYards = Math.max(...airYards) + 5;
              const minYards = Math.min(...airYards) - 5;
              const yardRange = maxYards - minYards;
              
              // Position QB at 0 yard line
              const normalizedY = (0 - minYards) / yardRange;
              const y = 100 - (normalizedY * 100);
              
              return (
                <g>
                  <line x1="0" y1={y} x2="100" y2={y} stroke="yellow" strokeWidth="0.8" opacity="0.8" />
                  <circle cx="50" cy={y} r="1.5" fill="yellow" opacity="0.9" />
                </g>
              );
            })()}
            
            {/* Pass dots */}
            {filteredData.map((pass, index) => {
              const pos = getPosition(pass, index);
              const isHovered = hoveredPass === index;
              const passType = getPassType(pass);
              
              let color, strokeColor;
              if (passType === 'interception') {
                color = '#ef4444';
                strokeColor = '#7f1d1d';
              } else if (passType === 'complete') {
                color = '#3b82f6';
                strokeColor = 'white';
              } else {
                color = '#f97316';
                strokeColor = 'white';
              }
              
              return (
                <g key={index}>
                  {isHovered && (() => {
                    const airYards = filteredData.map(p => p.air_yards);
                    const maxYards = Math.max(...airYards) + 5;
                    const minYards = Math.min(...airYards) - 5;
                    const yardRange = maxYards - minYards;
                    const normalizedY = (0 - minYards) / yardRange;
                    const qbY = 100 - (normalizedY * 100);
                    
                    return (
                      <line 
                        x1="50" 
                        y1={qbY} 
                        x2={pos.x} 
                        y2={pos.y}
                        stroke={color}
                        strokeWidth="0.3"
                        opacity="0.6"
                        strokeDasharray="1,1"
                      />
                    );
                  })()}
                  {passType === 'complete' ? (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? 2.5 : 1.8}
                      fill={color}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? "0.5" : "0.3"}
                      opacity={isHovered ? 1 : 0.85}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPass(index)}
                      onMouseLeave={() => setHoveredPass(null)}
                    />
                  ) : passType === 'interception' ? (
                    <g>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered ? 2.8 : 2.1}
                        fill={color}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? "0.6" : "0.4"}
                        opacity={isHovered ? 1 : 0.9}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPass(index)}
                        onMouseLeave={() => setHoveredPass(null)}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 0.8}
                        fill="white"
                        fontSize="2.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        !
                      </text>
                    </g>
                  ) : (
                    <g>
                      <line
                        x1={pos.x - 1.5}
                        y1={pos.y - 1.5}
                        x2={pos.x + 1.5}
                        y2={pos.y + 1.5}
                        stroke="white"
                        strokeWidth={isHovered ? "0.5" : "0.3"}
                      />
                      <line
                        x1={pos.x - 1.5}
                        y1={pos.y + 1.5}
                        x2={pos.x + 1.5}
                        y2={pos.y - 1.5}
                        stroke="white"
                        strokeWidth={isHovered ? "0.5" : "0.3"}
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered ? 2.5 : 1.8}
                        fill={color}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? "0.5" : "0.3"}
                        opacity={isHovered ? 1 : 0.85}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredPass(index)}
                        onMouseLeave={() => setHoveredPass(null)}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Hover tooltip */}
          {hoveredPass !== null && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 z-10">
              <div className="font-bold text-lg mb-1">
                {filteredData[hoveredPass].interception === 1.0 ? '⚠️ Interception' : 
                 filteredData[hoveredPass].complete_pass === 1.0 ? '✓ Complete' : '✗ Incomplete'}
              </div>
              <div className="text-sm space-y-1">
                <div>Air Yards: <span className="font-semibold">{filteredData[hoveredPass].air_yards}</span></div>
                <div>Location: <span className="font-semibold capitalize">{filteredData[hoveredPass].pass_location}</span></div>
                <div>Depth: <span className="font-semibold capitalize">{filteredData[hoveredPass].pass_length}</span></div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Legend */}
        {!loading && !error && filteredData.length > 0 && (
        <div className="mt-6 flex justify-center items-center gap-6 text-white flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3" viewBox="0 0 10 10">
                  <line x1="2" y1="2" x2="8" y2="8" stroke="white" strokeWidth="1"/>
                  <line x1="2" y1="8" x2="8" y2="2" stroke="white" strokeWidth="1"/>
                </svg>
              </div>
            </div>
            <span>Incomplete (X)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 relative flex items-center justify-center text-white font-bold text-xs">
              !
            </div>
            <span>Interception (!)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span>QB Position</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};