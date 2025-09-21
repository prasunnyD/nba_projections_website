import { useState, useEffect } from 'react';
import '../App.css';
import PlayerScoresChart from './PlayerScoresChart';
import TeamStatistics from './TeamStatistics';
import PlayerStatistics from './PlayerStatistics';
import TeamsDropdown from './TeamsDropdown';
import PlayerShotHexChart from './PlayerShotHexChart';
import { api } from '../utils/apiConfig';

export default function MainContainer({ teamName, homeTeam, awayTeam }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [numberOfGames, setNumberOfGames] = useState(10);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [rosterData, setRosterData] = useState([]);

  // Season selection
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');

  // Shots for hex chart (in FEET)
  const [shots, setShots] = useState(null);
  const [shotsLoading, setShotsLoading] = useState(false);
  const [shotsError, setShotsError] = useState(null);
  const [domains, setDomains] = useState({ x: [-25, 25], y: [-5, 47] }); // FEET

  // Baseline per zone (prefer league; fallback to player's zones)
  const [baselineZones, setBaselineZones] = useState(null);

  const handlePlayerSelect = (playerName) => {
    setSelectedPlayer(playerName);
    setNumberOfGames(10);
    setSelectedSeason(''); // will set after seasons load
  };
  const handleTeamSelect = (t) => setSelectedTeam(t);
  const handleRosterData = (roster) => setRosterData(roster);

  // When player changes, load their career seasons and default to most recent
  useEffect(() => {
    if (!selectedPlayer) {
      setSeasons([]);
      setSelectedSeason('');
      setShots(null);
      setBaselineZones(null);
      return;
    }
    api
      .get(`/players/${encodeURIComponent(selectedPlayer)}/seasons`)
      .then((res) => {
        const list = res.data?.seasons ?? [];
        setSeasons(list);
        setSelectedSeason(list[0] || '');
      })
      .catch(() => {
        setSeasons([]);
        setSelectedSeason('');
      });
  }, [selectedPlayer]);

  // Fetch season-specific shots (convert to feet) + baselines
  useEffect(() => {
    if (!selectedPlayer || !selectedSeason) return;

    setShotsLoading(true);
    setShotsError(null);

    // Shots for selected season (tenth-feet -> feet)
    api
      .get(`/players/${encodeURIComponent(selectedPlayer)}/shots`, {
        params: { season: selectedSeason },
      })
      .then((res) => {
        const raw = res.data?.shots ?? [];
        const feetShots = raw.map((s) => ({
          x: s.x / 10,
          y: s.y / 10,
          made: s.made,
        }));
        setShots(feetShots);

        if (res.data?.x_domain && res.data?.y_domain) {
          setDomains({
            x: [res.data.x_domain[0] / 10, res.data.x_domain[1] / 10],
            y: [res.data.y_domain[0] / 10, res.data.y_domain[1] / 10],
          });
        }
      })
      .catch((err) => {
        console.error('Shots API Error:', err);
        setShotsError('No shot data available for this selection.');
        setShots(null);
      })
      .finally(() => setShotsLoading(false));

    // Prefer league baselines; fallback to player's zones
    Promise.allSettled([
      api.get('/league/shot-zones', { params: { season: selectedSeason } }),
      api.get(`/players/${encodeURIComponent(selectedPlayer)}/shot-zones`, {
        params: { season: selectedSeason },
      }),
    ]).then(([leagueRes, playerRes]) => {
      let zones = null;
      if (leagueRes.status === 'fulfilled') {
        zones = leagueRes.value?.data?.zones ?? null;
      }
      if (!zones && playerRes.status === 'fulfilled') {
        zones = playerRes.value?.data?.zones ?? null;
      }
      setBaselineZones(zones);
    });
  }, [selectedPlayer, selectedSeason]);

  return (
    <div className="m-4 flex gap-4 bg-neutral-800">
      {/* Left Column - Teams */}
      <div className="w-1/4 rounded-lg bg-neutral-900 shadow p-4">
        <h2 className="text-2xl font-bold text-white mb-4">NBA Teams</h2>
        <TeamsDropdown
          onTeamSelect={handleTeamSelect}
          onRosterData={handleRosterData}
          onPlayerSelect={handlePlayerSelect}
        />
      </div>

      {/* Middle Column */}
      <div className="w-1/2 rounded-lg bg-neutral-900 shadow p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {selectedTeam ? `${selectedTeam} - ` : ''}Player Selected: {selectedPlayer || 'None'}
          </h2>
          <PlayerStatistics playerName={selectedPlayer} />
        </div>

        {selectedPlayer ? (
          <>
            <PlayerScoresChart
              playerName={selectedPlayer}
              numberOfGames={numberOfGames}
              setNumberOfGames={setNumberOfGames}
            />

            {/* Season selector sits DIRECTLY above the shot map */}
            <div className="mt-6 mb-2 flex items-center justify-end">
              <label className="text-slate-200 text-sm mr-2">Season:</label>
              <select
                className="border rounded px-2 py-1 bg-white/90 text-sm"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
              >
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Shot chart */}
            <div className="h-[720px]">
              <PlayerShotHexChart
                shots={shots}
                xDomain={domains.x}
                yDomain={domains.y}
                width={720}
                height={720}
                courtImgSrc="/basketball_court.png"
                playerName={selectedPlayer}
                seasonLabel={selectedSeason}
                baselineZones={baselineZones}
              />
            </div>
          </>
        ) : (
          <div className="p-4 text-gray-500 bg-gray-100 rounded-lg">
            Select a game card and then select a player to view their statistics.
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="w-1/4 rounded-lg bg-neutral-800 shadow p-4">
        <h2 className="text-xl font-bold text-white mb-4">Team Statistics</h2>
        <TeamStatistics />
      </div>
    </div>
  );
}
