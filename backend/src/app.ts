import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

app.use(express.json());

// Main Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'api executing', timestamp: new Date().toISOString() });
});

// App routing layers will attach here
app.use('/api', routes); // Main API endpoints

app.use(errorHandler);

export default app;
