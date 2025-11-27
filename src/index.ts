import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './env';
import { pool, testConnection } from './db';
import dustbinsRouter from './routes/dustbins';

const app = express();
const port = parseInt(env.PORT);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        database: {
            status: 'unknown',
            version: null as string | null
        }
    };

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        client.release();

        health.database.status = 'connected';
        health.database.version = result.rows[0].version;

        res.status(200).json(health);
    } catch (error) {
        health.status = 'degraded';
        health.database.status = 'disconnected';

        res.status(503).json({
            ...health,
            error: error instanceof Error ? error.message : 'Unknown database error'
        });
    }
});

// API Routes
app.use('/api/dustbins', dustbinsRouter);

// Test database connection on startup
testConnection().then((connected) => {
    if (!connected) {
        console.warn('⚠️  Server starting without database connection');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/dustbins`);
});
