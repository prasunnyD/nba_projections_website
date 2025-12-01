import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { api, logApiCall } from '../utils/apiConfig';

// Color helpers 
const TOTAL_NBA_TEAMS = 30;

const getRankColor = (rank, totalTeams = TOTAL_NBA_TEAMS) => {
  const r = Number(rank);
  if (!Number.isFinite(r) || r <= 0) return '#6B7280'; // gray for no/invalid rank

  // Normalize rank to 0..1 (1 best, N worst)
  const t = (r - 1) / (totalTeams - 1);

  // Colorblind-friendly: blue (good) -> light gray -> red (bad)
  if (t <= 0.5) {
    const k = t * 2; // 0..1 within first half
    const rr = Math.round(59 + (200 - 59) * k);
    const gg = Math.round(130 + (200 - 130) * k);
    const bb = Math.round(246 + (200 - 246) * k);
    return `rgb(${rr}, ${gg}, ${bb})`;
  } else {
    const k = (t - 0.5) * 2; // 0..1 within second half
    const rr = Math.round(200 + (220 - 200) * k);
    const gg = Math.round(200 + (20 - 200) * k);
    const bb = Math.round(200 + (20 - 200) * k);
    return `rgb(${rr}, ${gg}, ${bb})`;
  }
};

const getTextColor = (rank, totalTeams = TOTAL_NBA_TEAMS) => {
  const r = Number(rank);
  if (!Number.isFinite(r) || r <= 0) return 'white';
  // Use white on darker half, black on lighter half (threshold ~ middle)
  return r <= Math.ceil(totalTeams * 0.4) ? 'white' : 'black';
};

const normalizeRank = (x) => {
  if (x === '#' || x === '' || x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

const TeamStatistics = ({ awayTeam }) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NBA Teams with their cities
  const nbaTeams = [
    { city: 'Atlanta', name: 'Hawks' },
    { city: 'Boston', name: 'Celtics' },
    { city: 'Brooklyn', name: 'Nets' },
    { city: 'Charlotte', name: 'Hornets' },
    { city: 'Chicago', name: 'Bulls' },
    { city: 'Cleveland', name: 'Cavaliers' },
    { city: 'Dallas', name: 'Mavericks' },
    { city: 'Denver', name: 'Nuggets' },
    { city: 'Detroit', name: 'Pistons' },
    { city: 'Golden State', name: 'Warriors' },
    { city: 'Houston', name: 'Rockets' },
    { city: 'Indiana', name: 'Pacers' },
    { city: 'Los Angeles Lakers', name: 'Lakers' },
    { city: 'Los Angeles Clippers', name: 'Clippers' },
    { city: 'Memphis', name: 'Grizzlies' },
    { city: 'Miami', name: 'Heat' },
    { city: 'Milwaukee', name: 'Bucks' },
    { city: 'Minnesota', name: 'Timberwolves' },
    { city: 'New Orleans', name: 'Pelicans' },
    { city: 'New York', name: 'Knicks' },
    { city: 'Oklahoma City', name: 'Thunder' },
    { city: 'Orlando', name: 'Magic' },
    { city: 'Philadelphia', name: '76ers' },
    { city: 'Phoenix', name: 'Suns' },
    { city: 'Portland', name: 'Trail Blazers' },
    { city: 'Sacramento', name: 'Kings' },
    { city: 'San Antonio', name: 'Spurs' },
    { city: 'Toronto', name: 'Raptors' },
    { city: 'Utah', name: 'Jazz' },
    { city: 'Washington', name: 'Wizards' },
  ];

  const client = api;

  const handleTeamChange = (event) => {
    let teamCity = event.target.value;
    if (teamCity === 'Los Angeles Lakers Lakers') {
      teamCity = 'Los Angeles Lakers';
    } else if (teamCity === 'Los Angeles Clippers Clippers') {
      teamCity = 'LA Clippers';
    }
    setSelectedTeam(teamCity);
    setData(null);
    setError(null);
  };

  // Convert awayTeam format to match dropdown format
  const convertAwayTeamToDropdownFormat = (teamName) => {
    if (!teamName) return '';
    // Find matching team in nbaTeams array
    const team = nbaTeams.find(t => {
      const fullName = `${t.city} ${t.name}`;
      return fullName === teamName || t.city === teamName;
    });
    if (team) {
      // Return format that matches dropdown: "City Team"
      return `${team.city} ${team.name}`;
    }
    // Fallback: return as is
    return teamName;
  };

  // Auto-select awayTeam when it changes
  useEffect(() => {
    if (awayTeam && awayTeam !== selectedTeam) {
      const dropdownFormat = convertAwayTeamToDropdownFormat(awayTeam);
      if (dropdownFormat) {
        setSelectedTeam(dropdownFormat);
        setData(null);
        setError(null);
      }
    }
  }, [awayTeam]);

  // Convert team name to API format
  const convertToAPIFormat = (teamName) => {
    if (!teamName) return '';
    
    // Handle Clippers - API expects "LA Clippers"
    if (teamName === 'Los Angeles Clippers Clippers' || 
        teamName === 'Los Angeles Clippers' ||
        teamName.includes('Clippers')) {
      return 'LA Clippers';
    }
    
    // Handle Lakers - API expects "Los Angeles Lakers"
    if (teamName === 'Los Angeles Lakers Lakers' || 
        teamName === 'Los Angeles Lakers' ||
        (teamName.includes('Lakers') && teamName.includes('Los Angeles'))) {
      return 'Los Angeles Lakers';
    }
    
    // For other teams, return as is
    return teamName;
  };

  useEffect(() => {
    if (!selectedTeam) return;

    const fetchTeamStatistics = async () => {
      setLoading(true);
      try {
        // Convert to API format before making the call
        const apiTeamName = convertToAPIFormat(selectedTeam);
        const apiUrl = `nba/defense-stats/${apiTeamName}`;
        logApiCall('GET', apiUrl);

        const response = await client.get(apiUrl);
        // Use the API team name to get data from response
        const teamData = response.data[apiTeamName];

        setData({
          Defense: {
            DefensiveRating: {
              value: teamData.def_rating,
              rank: normalizeRank(teamData.def_rating_rank),
            },
            OPP_PTS_PAINT: {
              value: teamData.opp_pts_paint,
              rank: normalizeRank(teamData.opp_pts_paint_rank),
            },
          },
          Opponent: {
            OPP_FG_PCT: {
              value: teamData.opp_fg_pct,
              rank: normalizeRank(teamData.opp_fg_pct_rank),
            },
            OPP_REB: {
              value: teamData.opp_reb,
              rank: normalizeRank(teamData.opp_reb_rank),
            },
            OPP_AST: {
              value: teamData.opp_ast,
              rank: normalizeRank(teamData.opp_ast_rank),
            },
            OPP_FG3A: {
              value: teamData.opp_fg3a,
              rank: normalizeRank(teamData.opp_fg3a_rank),
            },
            OPP_FG3_PCT: {
              value: teamData.opp_fg3_pct,
              rank: normalizeRank(teamData.opp_fg3_pct_rank),
            },
          },
          FourFactor: {
            Pace: {
              value: teamData.pace,
              rank: normalizeRank(teamData.pace_rank),
            },
            OPP_EFG_PCT: {
              value: teamData.opp_efg_pct,
              rank: normalizeRank(teamData.opp_efg_pct_rank),
            },
            OPP_FTA_RATE: {
              value: teamData.opp_fta_rate,
              rank: normalizeRank(teamData.opp_fta_rate_rank),
            },
            OPP_OREB_PCT: {
              value: teamData.opp_oreb_pct,
              rank: normalizeRank(teamData.opp_oreb_pct_rank),
            },
          },
        });
      } catch (err) {
        console.error('API Error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStatistics();
  }, [selectedTeam]);

  return (
    <div className="bg-neutral-700 shadow-lg overflow-y-auto h-full">
      {/* Team Selection */}
      <div className="p-4 border-b border-gray-600">
        <label htmlFor="team-stats-select" className="block text-sm font-medium text-white mb-2">
          Select Team for Statistics
        </label>
        <select
          id="team-stats-select"
          value={selectedTeam}
          onChange={handleTeamChange}
          className="w-full p-2 bg-neutral-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a team...</option>
          {nbaTeams.map((team, index) => (
            <option key={index} value={team.city + ' ' + team.name}>
              {team.city} {team.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedTeam && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Select a team to view defensive statistics</div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error loading team statistics</div>
        </div>
      )}

      {data && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-white">
            {selectedTeam} Defensive Statistics
          </h1>

          {/* Stats Table with Rank-based Row Colors */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statistic
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  ...Object.entries(data.Defense).map(([key, stat]) => ({ name: key, ...stat })),
                  ...Object.entries(data.Opponent).map(([key, stat]) => ({ name: key, ...stat })),
                  ...Object.entries(data.FourFactor).map(([key, stat]) => ({ name: key, ...stat })),
                ].map((stat) => {
                  const bg = getRankColor(stat.rank);
                  const fg = getTextColor(stat.rank);
                  const displayValue =
                    typeof stat.value === 'number'
                      ? stat.name.includes('PCT') || stat.name.includes('RATE')
                        ? (stat.value * 100).toFixed(2) + '%'
                        : stat.value.toFixed(2)
                      : stat.value;

                  return (
                    <tr key={stat.name} style={{ backgroundColor: bg }}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold" style={{ color: fg }}>
                        {stat.name.replaceAll('_', ' ')}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-center font-bold" style={{ color: fg }}>
                        {stat.rank ? `#${stat.rank}` : '—'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-right font-semibold" style={{ color: fg }}>
                        {displayValue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Radar (kept) */}
          <div className="bg-neutral-700 shadow p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Defensive Profile</h2>
            <div className="w-full h-80">  {/* fixed container height; no overflow */}
                <Plot
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
                data={[
                    {
                    type: 'scatterpolar',
                    r: [
                        30 - (data.Defense.DefensiveRating.rank ?? 30),
                        30 - (data.Opponent.OPP_FG3A.rank ?? 30),
                        30 - (data.Opponent.OPP_REB.rank ?? 30),
                        30 - (data.Opponent.OPP_AST.rank ?? 30),
                        30 - (data.FourFactor.Pace.rank ?? 30),
                    ],
                    theta: ['Defense Rating', 'Opp 3PA', 'Opp Rebounds', 'Opp Assists', 'Pace'],
                    fill: 'toself',
                    name: selectedTeam,
                    },
                ]}
                layout={{
                    autosize: true,
                    margin: { l: 20, r: 20, t: 10, b: 10 },  // trim whitespace
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    polar: {
                    radialaxis: { visible: true, range: [0, 30], tickfont: { size: 10 } },
                    angularaxis: { tickfont: { size: 11 } },
                    },
                    showlegend: false,
                }}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatistics;