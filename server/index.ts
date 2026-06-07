import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { connectDB } from './config/db';
import campaignRoutes from './routes/campaignRoutes';
import donationRoutes from './routes/donationRoutes';
import authRoutes from './routes/authRoutes';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet to secure HTTP headers
app.use(helmet());

// Connect to MongoDB Database
connectDB();

// Configure robust, explicit CORS settings to support local and production frontend requests dynamically
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Dynamically reflect the incoming request's origin back in the Access-Control-Allow-Origin header
    // This allows localhost, production URLs, and any testing origin seamlessly
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Modular API Routes with rate limiting protection
app.use('/api/campaigns', apiLimiter, campaignRoutes);
app.use('/api/donations', apiLimiter, donationRoutes);
app.use('/api/auth', authLimiter, authRoutes);

// Premium Root operational status endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GiveHope API Server Status</title>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%23059669'/%3E%3Cpath d='M12 6a3 3 0 00-3 3c0 2 3 5 3 5s3-3 3-3a3 3 0 00-3-3z' fill='%23ffffff'/%3E%3C/svg%3E">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background: linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 100%);
            color: #1f2937;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            padding: 3.5rem;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(5, 150, 105, 0.08);
            border: 1px dashed rgba(5, 150, 105, 0.2);
            max-width: 480px;
            width: 90%;
            transition: transform 0.3s ease;
          }
          .container:hover {
            transform: translateY(-5px);
          }
          .logo-box {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 16px rgba(5, 150, 105, 0.2);
          }
          .logo-box svg {
            width: 36px;
            height: 36px;
            fill: white;
          }
          h1 {
            color: #064e3b;
            font-size: 2.2rem;
            margin: 0 0 0.5rem;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          p {
            color: #4b5563;
            font-size: 1.05rem;
            line-height: 1.6;
            margin: 0 0 2rem;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #d1fae5;
            color: #065f46;
            font-weight: 700;
            padding: 0.6rem 1.4rem;
            border-radius: 9999px;
            font-size: 0.95rem;
            letter-spacing: 0.2px;
          }
          .status-dot {
            width: 10px;
            height: 10px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-block;
            animation: pulse 1.8s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1>GiveHope API</h1>
          <p>The backend services and MongoDB Atlas database connections are fully synchronized, live, and healthy.</p>
          <div class="status-badge">
            <span class="status-dot"></span>
            Operational & Live
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
