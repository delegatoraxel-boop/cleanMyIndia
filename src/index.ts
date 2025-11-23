import express, { Request, Response } from 'express';
import { env } from './env.js';

const app = express();
const port = parseInt(env.PORT);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
