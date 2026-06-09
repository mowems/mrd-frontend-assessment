import express, { Request, Response } from 'express';
import path from 'path';
import { fetchRestaurantDetails } from './api';
import { runWithConcurrency } from './concurrency';
import { list } from './restaurants';

const app = express();
const PORT = process.env.PORT || 3000;
const RESTAURANT_CONCURRENCY_LIMIT = 5;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Example API route
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
});

// Streaming endpoint - sends chunks every 0.3 seconds for 5 seconds
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-ndjson'); // newline-delimited JSON
  res.setHeader('Cache-Control', 'no-cache');

  let counter = 0;
  const maxDuration = 3000; // 3 seconds
  const interval = 100; // 0.1 seconds
  const startTime = Date.now();

  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    counter++;

    const chunk = {
      type: 'progress',
      progress: counter,
    };

    res.write(JSON.stringify(chunk) + '\n');

    // Check if we've exceeded the max duration
    if (elapsed >= maxDuration) {
      clearInterval(intervalId);
      const conclusionChunk = {
        type: 'conclusion',
        conclusion: `Streaming completed after ${counter} updates`,
      };
      res.write(JSON.stringify(conclusionChunk) + '\n');
      res.end();
    }
  }, interval);
});

app.get('/api/restaurants/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  const total = list.length;
  let completed = 0;

  const writeChunk = (chunk: unknown) => {
    res.write(`${JSON.stringify(chunk)}\n`);
  };

  writeChunk({
    type: 'initial',
    restaurants: list,
    total,
  });

  const tasks = list.map((restaurant) => async () => {
    const details = await fetchRestaurantDetails(restaurant.id);

    return {
      restaurantId: restaurant.id,
      details,
    };
  });

  await runWithConcurrency(
    tasks,
    RESTAURANT_CONCURRENCY_LIMIT,
    ({ details }) => {
      completed++;

      writeChunk({
        type: 'details-update',
        restaurant: details,
      });

      writeChunk({
        type: 'progress',
        completed,
        total,
      });
    },
    (error, index) => {
      completed++;

      const restaurant = list[index];
      const message = error instanceof Error ? error.message : 'Unknown error';

      writeChunk({
        type: 'restaurant-error',
        id: restaurant.id,
        error: message,
      });

      writeChunk({
        type: 'progress',
        completed,
        total,
      });
    },
  );

  writeChunk({
    type: 'conclusion',
    conclusion: `Restaurant loading complete. Processed ${completed} of ${total} restaurants.`,
  });

  res.end();
});

// Serve index.html for root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});