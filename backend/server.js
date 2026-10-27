import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import authRoutes from './src/routes/auth.js';
import venueRoutes from './src/routes/venues.js';
import bookingRoutes from './src/routes/bookings.js';
import gameRoutes from './src/routes/games.js';
import userRoutes from './src/routes/users.js';
import newsRoutes from './src/routes/news.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }
});
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'PlayNow API' }));
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);

io.on('connection', socket => {
  socket.on('chat:join', room => {
    if (typeof room === 'string' && room.length < 100) socket.join(room);
  });
  socket.on('chat:message', message => {
    if (!message || typeof message.room !== 'string' ||
        typeof message.text !== 'string' || message.text.trim().length === 0 ||
        message.text.length > 1000) return;
    const safeMessage = {
      room: message.room.slice(0, 100),
      text: message.text.trim(),
      sender: String(message.sender || 'Player').slice(0, 60),
      createdAt: new Date().toISOString()
    };
    io.to(safeMessage.room).emit('chat:message', safeMessage);
  });
});

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/playnow');
  server.listen(port, () => console.log(`PlayNow API running on port ${port}`));
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}
