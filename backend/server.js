import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { initializeDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
// In production, restrict to the deployed frontend URL only
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json());

// --- Health Check ---
// Used by Render to verify the service is alive
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/stats', statsRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// --- Start Server ---
// Initialize DB first, then start listening
initializeDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database. Server not started.', err);
        process.exit(1);
    });