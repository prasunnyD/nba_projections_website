# Local Development Setup

This guide explains how to set up and use the localhost API for development and testing.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Mock API Server
```bash
npm run dev:api
```

### 3. Start the Frontend Development Server
```bash
npm run dev
```

### 4. Or Start Both Together
```bash
npm run dev:full
```

## How It Works

### API Configuration
- **Development**: Uses proxy to `http://localhost:8000` via `/api` prefix
- **Production**: Uses the actual API at `https://api.sharpr-analytics.com`

### Mock API Server
The mock server (`mock-api-server.js`) provides:
- **Team Rosters**: `/team-roster/:team`
- **Defense Stats**: `/:team-defense-stats`
- **Health Check**: `/health`

### Available Mock Data
Currently includes sample data for:
- Atlanta Hawks
- Boston Celtics
- Golden State Warriors

Other teams will return empty rosters or default stats.

## Testing the Setup

### 1. Test the Mock API Server
```bash
curl http://localhost:8000/health
```

### 2. Test Team Roster Endpoint
```bash
curl http://localhost:8000/team-roster/Atlanta
```

### 3. Test Defense Stats Endpoint
```bash
curl http://localhost:8000/Atlanta-defense-stats
```

## Development Workflow

1. **Start the mock server** in one terminal:
   ```bash
   npm run dev:api
   ```

2. **Start the frontend** in another terminal:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

4. **Check the browser console** for API call logs (🚀 emoji)

## Adding More Mock Data

To add more teams to the mock server, edit `mock-api-server.js`:

```javascript
const mockRosters = {
  'Your Team': [
    { NUM: '1', PLAYER: 'Player Name', POSITION: 'PG' },
    // ... more players
  ]
};
```

## Switching Between Local and Production

The application automatically detects the environment:
- **Development**: Uses localhost API via proxy
- **Production**: Uses the actual API

No manual configuration needed!

## Troubleshooting

### Port Already in Use
If port 8000 is busy, change it in `mock-api-server.js`:
```javascript
const PORT = 8001; // or any available port
```

### CORS Issues
The mock server includes CORS headers, but if you have issues:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### API Calls Not Working
1. Check that the mock server is running
2. Check browser console for errors
3. Verify the proxy configuration in `vite.config.js`
4. Ensure you're using the updated API configuration utilities

## Environment Variables

You can create a `.env.local` file for additional configuration:
```
VITE_API_URL=http://localhost:8000
VITE_USE_LOCAL_API=true
```

## Next Steps

1. Add more mock data for all NBA teams
2. Implement additional API endpoints as needed
3. Add error handling and loading states
4. Set up automated testing for the API endpoints 