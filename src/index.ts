import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './env.js';
import { pool, testConnection } from './db.js';
import dustbinsRouter from './routes/dustbins.js';

const app = express();
const port = parseInt(env.PORT);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

app.get('/db-health', async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        client.release();
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            version: result.rows[0].version
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
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
