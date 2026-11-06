import { useState } from 'react';
import axios from 'axios';
import '../App.css';

const initialMatchState = {
  sets_a: 0,
  sets_b: 0,
  games_a: 0,
  games_b: 0,
  server: 'A',
};

export default function ATPLive() {
  const [url, setUrl] = useState('');
  const [matchState, setMatchState] = useState(initialMatchState);
  const [bestOf, setBestOf] = useState(3);
  const [pointStateType, setPointStateType] = useState('none');
  const [pointState, setPointState] = useState([0, 0]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setsToWin = Math.ceil(bestOf / 2);

  const updateMatchState = (event) => {
    const { name, value, type } = event.target;
    setMatchState((current) => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const updatePointState = (index, value) => {
    setPointState((current) =>
      current.map((point, pointIndex) =>
        pointIndex === index ? Number(value) : point,
      ),
    );
  };

  const getPointStatePayload = () => {
    if (pointStateType === 'deuce') {
      return 'DEUCE';
    }

    if (pointStateType === 'tuple') {
      return pointState;
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    const payload = {
      url: url.trim(),
      match_state: {
        ...matchState,
        point_state: getPointStatePayload(),
      },
      best_of: bestOf,
    };

    try {
      const response = await axios.post('/api/simulate/live', payload);
      const playerAProbability = response.data?.player_a_win_probability;
      const playerBProbability = response.data?.player_b_win_probability;

      if (
        typeof playerAProbability !== 'number' ||
        typeof playerBProbability !== 'number'
      ) {
        throw new Error('The API response did not include both win probabilities.');
      }

      setResult({
        playerA: response.data.player_a,
        playerAProbability,
        playerB: response.data.player_b,
        playerBProbability,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ??
          requestError.message ??
          'Unable to run the live simulation.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const numberInputClass =
    'min-w-0 w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-2 text-white focus:border-blue-500 focus:outline-none sm:px-3';
  const labelClass = 'block text-sm font-medium text-neutral-200';

  return (
    <main className="mx-auto max-w-3xl p-4 text-white">
      <section className="rounded-lg bg-neutral-900 p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">ATP Live Match Simulation</h1>

        {result && (
          <div
            className="mb-6 grid gap-4 rounded bg-neutral-800 p-5 text-center sm:grid-cols-2"
            aria-live="polite"
          >
            <div>
              <h2 className="text-lg font-semibold">
                {result.playerA || 'Player A'} win probability
              </h2>
              <p className="mt-2 text-4xl font-bold text-blue-400">
                {(result.playerAProbability * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {result.playerB || 'Player B'} win probability
              </h2>
              <p className="mt-2 text-4xl font-bold text-emerald-400">
                {(result.playerBProbability * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className={labelClass}>
            ATP Stats Centre URL
            <input
              className={`${numberInputClass} mt-2`}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.atptour.com/en/scores/stats-centre/live/..."
              required
            />
          </label>

          <fieldset>
            <legend className="mb-3 text-lg font-semibold">Match state</legend>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                ['sets_a', 'Player A sets', setsToWin],
                ['sets_b', 'Player B sets', setsToWin],
                ['games_a', 'Player A games', 7],
                ['games_b', 'Player B games', 7],
              ].map(([name, label, max]) => (
                <label className={labelClass} key={name}>
                  {label}
                  <input
                    className={`${numberInputClass} mt-2`}
                    type="number"
                    name={name}
                    min="0"
                    max={max}
                    value={matchState[name]}
                    onChange={updateMatchState}
                    required
                  />
                </label>
              ))}

              <label className={labelClass}>
                Server
                <select
                  className={`${numberInputClass} mt-2`}
                  name="server"
                  value={matchState.server}
                  onChange={updateMatchState}
                >
                  <option value="A">Player A</option>
                  <option value="B">Player B</option>
                </select>
              </label>

              <label className={labelClass}>
                Best of
                <select
                  className={`${numberInputClass} mt-2`}
                  value={bestOf}
                  onChange={(event) => setBestOf(Number(event.target.value))}
                >
                  <option value={3}>3 sets</option>
                  <option value={5}>5 sets</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-lg font-semibold">Point state</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                State
                <select
                  className={`${numberInputClass} mt-2`}
                  value={pointStateType}
                  onChange={(event) => setPointStateType(event.target.value)}
                >
                  <option value="none">None</option>
                  <option value="deuce">Deuce</option>
                  <option value="tuple">Point tuple</option>
                </select>
              </label>

              {pointStateType === 'tuple' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Player A point', 'Player B point'].map((label, index) => (
                    <label className={labelClass} key={label}>
                      {label}
                      <input
                        className={`${numberInputClass} mt-2`}
                        type="number"
                        min="0"
                        max="4"
                        value={pointState[index]}
                        onChange={(event) =>
                          updatePointState(index, event.target.value)
                        }
                        required
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          <button
            className="rounded bg-blue-600 px-5 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Simulating…' : 'Simulate match'}
          </button>
        </form>

        {error && (
          <p className="mt-6 rounded bg-red-950 p-4 text-red-200" role="alert">
            {error}
          </p>
        )}

      </section>
    </main>
  );
}