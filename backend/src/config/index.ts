import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
  databaseUrl: process.env.DATABASE_URL,
  storagePath: process.env.STORAGE_PATH || '/var/discord-bots-storage',
  dockerSock: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
};