import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Discord Bot Hosting Platform', timestamp: new Date() });
});

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});