import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for team rosters
const mockRosters = {
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

// Mock data for team defense stats
const mockDefenseStats = {
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

// Routes
app.get('/team-roster/:team', (req, res) => {
  const team = req.params.team;
  console.log(`📋 GET /team-roster/${team}`);
  
  if (mockRosters[team]) {
    res.json({ [team]: mockRosters[team] });
  } else {
    // Return empty roster for teams not in mock data
    res.json({ [team]: [] });
  }
});

app.get('/:team-defense-stats', (req, res) => {
  const team = req.params.team.replace('-defense-stats', '');
  console.log(`📊 GET /${team}-defense-stats`);
  
  if (mockDefenseStats[team]) {
    res.json(mockDefenseStats[team]);
  } else {
    // Return default stats for teams not in mock data
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET /team-roster/:team`);
  console.log(`   - GET /:team-defense-stats`);
  console.log(`   - GET /health`);
  console.log(`\n🎯 Test with: curl http://localhost:${PORT}/health`);
}); 