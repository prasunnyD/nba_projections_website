import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for NBA team rosters
const nbaRosters = {
  'Atlanta': [
    { NUM: '1', PLAYER: 'Trae Young', POSITION: 'PG' },
    { NUM: '2', PLAYER: 'Dejounte Murray', POSITION: 'SG' },
    { NUM: '3', PLAYER: 'Bogdan Bogdanovic', POSITION: 'SF' },
    { NUM: '4', PLAYER: 'John Collins', POSITION: 'PF' },
    { NUM: '5', PLAYER: 'Clint Capela', POSITION: 'C' }
  ],
  'Boston': [
    { NUM: '0', PLAYER: 'Jayson Tatum', POSITION: 'SF' },
    { NUM: '7', PLAYER: 'Jaylen Brown', POSITION: 'SG' },
    { NUM: '9', PLAYER: 'Derrick White', POSITION: 'PG' },
    { NUM: '42', PLAYER: 'Al Horford', POSITION: 'C' },
    { NUM: '44', PLAYER: 'Robert Williams', POSITION: 'C' }
  ],
  'Golden State': [
    { NUM: '30', PLAYER: 'Stephen Curry', POSITION: 'PG' },
    { NUM: '11', PLAYER: 'Klay Thompson', POSITION: 'SG' },
    { NUM: '23', PLAYER: 'Draymond Green', POSITION: 'PF' },
    { NUM: '22', PLAYER: 'Andrew Wiggins', POSITION: 'SF' },
    { NUM: '5', PLAYER: 'Kevon Looney', POSITION: 'C' }
  ]
};

// Mock data for NFL team rosters
const nflRosters = {
  'Kansas City': [
    { NUM: '15', PLAYER: 'Patrick Mahomes', POSITION: 'QB' },
    { NUM: '10', PLAYER: 'Travis Kelce', POSITION: 'TE' },
    { NUM: '87', PLAYER: 'Rashee Rice', POSITION: 'WR' },
    { NUM: '25', PLAYER: 'Isiah Pacheco', POSITION: 'RB' },
    { NUM: '95', PLAYER: 'Chris Jones', POSITION: 'DT' }
  ],
  'Buffalo': [
    { NUM: '17', PLAYER: 'Josh Allen', POSITION: 'QB' },
    { NUM: '14', PLAYER: 'Stefon Diggs', POSITION: 'WR' },
    { NUM: '26', PLAYER: 'Devin Singletary', POSITION: 'RB' },
    { NUM: '55', PLAYER: 'Von Miller', POSITION: 'OLB' },
    { NUM: '23', PLAYER: 'Jordan Poyer', POSITION: 'S' }
  ],
  'Dallas': [
    { NUM: '4', PLAYER: 'Dak Prescott', POSITION: 'QB' },
    { NUM: '88', PLAYER: 'CeeDee Lamb', POSITION: 'WR' },
    { NUM: '20', PLAYER: 'Tony Pollard', POSITION: 'RB' },
    { NUM: '11', PLAYER: 'Micah Parsons', POSITION: 'LB' },
    { NUM: '7', PLAYER: 'Trevon Diggs', POSITION: 'CB' }
  ]
};

// Mock data for NBA team defense stats
const nbaDefenseStats = {
  'Atlanta': {
    'Atlanta': {
      DEF_RATING: 115.2,
      DEF_RATING_RANK: 15,
      OPP_PTS_PAINT: 48.5,
      OPP_PTS_PAINT_RANK: 12,
      OPP_FG_PCT: 0.465,
      OPP_FG_PCT_RANK: 18,
      OPP_REB: 42.3,
      OPP_REB_RANK: 14,
      OPP_AST: 24.1,
      OPP_AST_RANK: 16,
      OPP_FG3A: 35.2,
      OPP_FG3A_RANK: 20,
      OPP_FG3_PCT: 0.358,
      OPP_FG3_PCT_RANK: 13,
      PACE: 100.5,
      PACE_RANK: 8,
      OPP_EFG_PCT: 0.532,
      OPP_EFG_PCT_RANK: 17,
      OPP_FTA_RATE: 0.245,
      OPP_FTA_RATE_RANK: 19,
      OPP_OREB_PCT: 0.285,
      OPP_OREB_PCT_RANK: 11
    }
  },
  'Boston': {
    'Boston': {
      DEF_RATING: 110.8,
      DEF_RATING_RANK: 3,
      OPP_PTS_PAINT: 44.2,
      OPP_PTS_PAINT_RANK: 3,
      OPP_FG_PCT: 0.445,
      OPP_FG_PCT_RANK: 4,
      OPP_REB: 40.1,
      OPP_REB_RANK: 2,
      OPP_AST: 22.3,
      OPP_AST_RANK: 4,
      OPP_FG3A: 32.8,
      OPP_FG3A_RANK: 8,
      OPP_FG3_PCT: 0.342,
      OPP_FG3_PCT_RANK: 6,
      PACE: 98.7,
      PACE_RANK: 15,
      OPP_EFG_PCT: 0.512,
      OPP_EFG_PCT_RANK: 5,
      OPP_FTA_RATE: 0.228,
      OPP_FTA_RATE_RANK: 12,
      OPP_OREB_PCT: 0.265,
      OPP_OREB_PCT_RANK: 3
    }
  }
};

// Mock data for NFL team defense stats
const nflDefenseStats = {
  'Kansas City': {
    'Kansas City': {
      DEF_RATING: 108.5,
      DEF_RATING_RANK: 2,
      OPP_PTS_PAINT: 18.2,
      OPP_PTS_PAINT_RANK: 4,
      OPP_FG_PCT: 0.385,
      OPP_FG_PCT_RANK: 3,
      OPP_REB: 98.5,
      OPP_REB_RANK: 8,
      OPP_AST: 6.2,
      OPP_AST_RANK: 5,
      OPP_FG3A: 8.5,
      OPP_FG3A_RANK: 12,
      OPP_FG3_PCT: 0.325,
      OPP_FG3_PCT_RANK: 6,
      PACE: 65.2,
      PACE_RANK: 15,
      OPP_EFG_PCT: 0.485,
      OPP_EFG_PCT_RANK: 4,
      OPP_FTA_RATE: 0.185,
      OPP_FTA_RATE_RANK: 8,
      OPP_OREB_PCT: 0.245,
      OPP_OREB_PCT_RANK: 7
    }
  },
  'Buffalo': {
    'Buffalo': {
      DEF_RATING: 112.3,
      DEF_RATING_RANK: 8,
      OPP_PTS_PAINT: 22.1,
      OPP_PTS_PAINT_RANK: 12,
      OPP_FG_PCT: 0.415,
      OPP_FG_PCT_RANK: 10,
      OPP_REB: 102.3,
      OPP_REB_RANK: 15,
      OPP_AST: 7.8,
      OPP_AST_RANK: 12,
      OPP_FG3A: 9.2,
      OPP_FG3A_RANK: 18,
      OPP_FG3_PCT: 0.365,
      OPP_FG3_PCT_RANK: 14,
      PACE: 68.5,
      PACE_RANK: 8,
      OPP_EFG_PCT: 0.512,
      OPP_EFG_PCT_RANK: 12,
      OPP_FTA_RATE: 0.215,
      OPP_FTA_RATE_RANK: 15,
      OPP_OREB_PCT: 0.285,
      OPP_OREB_PCT_RANK: 18
    }
  }
};

// Routes
app.get('/nba/team-roster/:team', (req, res) => {
  const team = req.params.team;
  console.log(`📋 GET /nba/team-roster/${team}`);
  
  if (nbaRosters[team]) {
    res.json({ [team]: nbaRosters[team] });
  } else {
    res.json({ [team]: [] });
  }
});

app.get('/nfl/team-roster/:team', (req, res) => {
  const team = req.params.team;
  console.log(`📋 GET /nfl/team-roster/${team}`);
  
  if (nflRosters[team]) {
    res.json({ [team]: nflRosters[team] });
  } else {
    res.json({ [team]: [] });
  }
});

app.get('/nba/:team-defense-stats', (req, res) => {
  const team = req.params.team.replace('-defense-stats', '');
  console.log(`📊 GET /nba/${team}-defense-stats`);
  
  if (nbaDefenseStats[team]) {
    res.json(nbaDefenseStats[team]);
  } else {
    res.json({
      [team]: {
        DEF_RATING: 112.0,
        DEF_RATING_RANK: 10,
        OPP_PTS_PAINT: 46.0,
        OPP_PTS_PAINT_RANK: 10,
        OPP_FG_PCT: 0.455,
        OPP_FG_PCT_RANK: 10,
        OPP_REB: 41.0,
        OPP_REB_RANK: 10,
        OPP_AST: 23.0,
        OPP_AST_RANK: 10,
        OPP_FG3A: 34.0,
        OPP_FG3A_RANK: 10,
        OPP_FG3_PCT: 0.350,
        OPP_FG3_PCT_RANK: 10,
        PACE: 99.0,
        PACE_RANK: 10,
        OPP_EFG_PCT: 0.520,
        OPP_EFG_PCT_RANK: 10,
        OPP_FTA_RATE: 0.235,
        OPP_FTA_RATE_RANK: 10,
        OPP_OREB_PCT: 0.275,
        OPP_OREB_PCT_RANK: 10
      }
    });
  }
});

app.get('/nfl/:team-defense-stats', (req, res) => {
  const team = req.params.team.replace('-defense-stats', '');
  console.log(`📊 GET /nfl/${team}-defense-stats`);
  
  if (nflDefenseStats[team]) {
    res.json(nflDefenseStats[team]);
  } else {
    res.json({
      [team]: {
        DEF_RATING: 110.0,
        DEF_RATING_RANK: 10,
        OPP_PTS_PAINT: 20.0,
        OPP_PTS_PAINT_RANK: 10,
        OPP_FG_PCT: 0.400,
        OPP_FG_PCT_RANK: 10,
        OPP_REB: 100.0,
        OPP_REB_RANK: 10,
        OPP_AST: 7.0,
        OPP_AST_RANK: 10,
        OPP_FG3A: 8.8,
        OPP_FG3A_RANK: 10,
        OPP_FG3_PCT: 0.345,
        OPP_FG3_PCT_RANK: 10,
        PACE: 66.5,
        PACE_RANK: 10,
        OPP_EFG_PCT: 0.500,
        OPP_EFG_PCT_RANK: 10,
        OPP_FTA_RATE: 0.200,
        OPP_FTA_RATE_RANK: 10,
        OPP_OREB_PCT: 0.265,
        OPP_OREB_PCT_RANK: 10
      }
    });
  }
});

// Legacy routes for backward compatibility
app.get('/team-roster/:team', (req, res) => {
  const team = req.params.team;
  console.log(`📋 GET /team-roster/${team}`);
  
  if (nbaRosters[team]) {
    res.json({ [team]: nbaRosters[team] });
  } else {
    res.json({ [team]: [] });
  }
});

app.get('/:team-defense-stats', (req, res) => {
  const team = req.params.team.replace('-defense-stats', '');
  console.log(`📊 GET /${team}-defense-stats`);
  
  if (nbaDefenseStats[team]) {
    res.json(nbaDefenseStats[team]);
  } else {
    res.json({
      [team]: {
        DEF_RATING: 112.0,
        DEF_RATING_RANK: 10,
        OPP_PTS_PAINT: 46.0,
        OPP_PTS_PAINT_RANK: 10,
        OPP_FG_PCT: 0.455,
        OPP_FG_PCT_RANK: 10,
        OPP_REB: 41.0,
        OPP_REB_RANK: 10,
        OPP_AST: 23.0,
        OPP_AST_RANK: 10,
        OPP_FG3A: 34.0,
        OPP_FG3A_RANK: 10,
        OPP_FG3_PCT: 0.350,
        OPP_FG3_PCT_RANK: 10,
        PACE: 99.0,
        PACE_RANK: 10,
        OPP_EFG_PCT: 0.520,
        OPP_EFG_PCT_RANK: 10,
        OPP_FTA_RATE: 0.235,
        OPP_FTA_RATE_RANK: 10,
        OPP_OREB_PCT: 0.275,
        OPP_OREB_PCT_RANK: 10
      }
    });
  }
});

// Mock scoreboard data
app.get('/nba/scoreboard', (req, res) => {
  console.log(`🏀 GET /nba/scoreboard`);
  res.json({
    'game1': { home_team: 'Boston', away_team: 'Atlanta' },
    'game2': { home_team: 'Golden State', away_team: 'Los Angeles Lakers' },
    'game3': { home_team: 'Miami', away_team: 'Chicago' }
  });
});

app.get('/nfl/scoreboard', (req, res) => {
  console.log(`🏈 GET /nfl/scoreboard`);
  res.json({
    'game1': { home_team: 'Kansas City', away_team: 'Buffalo' },
    'game2': { home_team: 'Dallas', away_team: 'Philadelphia' },
    'game3': { home_team: 'San Francisco', away_team: 'Green Bay' }
  });
});

// Mock player statistics data
app.get('/nba/:player-shooting-splits', (req, res) => {
  const player = req.params.player.replace('-shooting-splits', '');
  console.log(`📊 GET /nba/${player}-shooting-splits`);
  res.json({
    [player]: {
      FG2A: 8.5,
      FG2M: 4.2,
      FG2_PCT: 0.494,
      FG2A_FREQUENCY: 0.65,
      FG3A: 4.5,
      FG3M: 1.8,
      FG3_PCT: 0.400,
      FG3A_FREQUENCY: 0.35,
      FG_PCT: 0.467,
      EFG_PCT: 0.534
    }
  });
});

app.get('/nfl/:player-shooting-splits', (req, res) => {
  const player = req.params.player.replace('-shooting-splits', '');
  console.log(`📊 GET /nfl/${player}-shooting-splits`);
  res.json({
    [player]: {
      FG2A: 0.0,
      FG2M: 0.0,
      FG2_PCT: 0.000,
      FG2A_FREQUENCY: 0.00,
      FG3A: 0.0,
      FG3M: 0.0,
      FG3_PCT: 0.000,
      FG3A_FREQUENCY: 0.00,
      FG_PCT: 0.000,
      EFG_PCT: 0.000
    }
  });
});

app.get('/nba/:player-headline-stats', (req, res) => {
  const player = req.params.player.replace('-headline-stats', '');
  console.log(`📊 GET /nba/${player}-headline-stats`);
  res.json({
    [player]: {
      PTS: 22.5,
      REB: 5.8,
      AST: 8.2
    }
  });
});

app.get('/nfl/:player-headline-stats', (req, res) => {
  const player = req.params.player.replace('-headline-stats', '');
  console.log(`📊 GET /nfl/${player}-headline-stats`);
  res.json({
    [player]: {
      PTS: 0.0,
      REB: 0.0,
      AST: 0.0
    }
  });
});

// Mock player game history data
app.get('/nba/player-last-:games-games/:player', (req, res) => {
  const games = req.params.games;
  const player = req.params.player;
  console.log(`📊 GET /nba/player-last-${games}-games/${player}`);
  
  const gameData = {};
  const today = new Date();
  for (let i = 0; i < games; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    gameData[dateStr] = {
      points: Math.floor(Math.random() * 30) + 10,
      rebounds: Math.floor(Math.random() * 10) + 2,
      assists: Math.floor(Math.random() * 8) + 3
    };
  }
  res.json(gameData);
});

app.get('/nfl/player-last-:games-games/:player', (req, res) => {
  const games = req.params.games;
  const player = req.params.player;
  console.log(`📊 GET /nfl/player-last-${games}-games/${player}`);
  
  const gameData = {};
  const today = new Date();
  for (let i = 0; i < games; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    gameData[dateStr] = {
      points: Math.floor(Math.random() * 20) + 5,
      rebounds: Math.floor(Math.random() * 5) + 1,
      assists: Math.floor(Math.random() * 3) + 1
    };
  }
  res.json(gameData);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   NBA:`);
  console.log(`   - GET /nba/scoreboard`);
  console.log(`   - GET /nba/team-roster/:team`);
  console.log(`   - GET /nba/:team-defense-stats`);
  console.log(`   - GET /nba/:player-shooting-splits`);
  console.log(`   - GET /nba/:player-headline-stats`);
  console.log(`   - GET /nba/player-last-:games-games/:player`);
  console.log(`   NFL:`);
  console.log(`   - GET /nfl/scoreboard`);
  console.log(`   - GET /nfl/team-roster/:team`);
  console.log(`   - GET /nfl/:team-defense-stats`);
  console.log(`   - GET /nfl/:player-shooting-splits`);
  console.log(`   - GET /nfl/:player-headline-stats`);
  console.log(`   - GET /nfl/player-last-:games-games/:player`);
  console.log(`   Legacy:`);
  console.log(`   - GET /team-roster/:team`);
  console.log(`   - GET /:team-defense-stats`);
  console.log(`   - GET /health`);
  console.log(`\n🎯 Test with: curl http://localhost:${PORT}/health`);
}); 