import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const docker = new Docker({ socketPath: config.dockerSock });

export class DockerService {
  static async createBotContainer(
    botId: string,
    runtime: 'NODEJS' | 'PYTHON',
    cpuLimit: number,
    ramLimit: number,
    envVars: Record<string, string>
  ): Promise<string> {
    const imageName = runtime === 'NODEJS' ? 'node:20-alpine' : 'python:3.11-slim';
    const botStoragePath = path.join(config.storagePath, botId);

    if (!fs.existsSync(botStoragePath)) {
      fs.mkdirSync(botStoragePath, { recursive: true });
    }

    const envArray = Object.entries(envVars).map(([k, v]) => `${k}=${v}`);

    const container = await docker.createContainer({
      Image: imageName,
      name: `discord-bot-${botId}`,
      Env: envArray,
      HostConfig: {
        Binds: [`${botStoragePath}:/usr/src/app`],
        Memory: ramLimit * 1024 * 1024,
        NanoCpus: Math.floor(cpuLimit * 1e9),
        NetworkMode: 'bridge',
        AutoRemove: false,
      },
      WorkingDir: '/usr/src/app',
      Tty: true,
      OpenStdin: true,
    });

    return container.id;
  }

  static async startContainer(containerId: string): Promise<void> {
    const container = docker.getContainer(containerId);
    await container.start();
  }

  static async stopContainer(containerId: string): Promise<void> {
    const container = docker.getContainer(containerId);
    try {
      await container.stop({ t: 5 });
    } catch (err: any) {
      if (!err.message.includes('not running')) {
        throw err;
      }
    }
  }

  static async getContainerStats(containerId: string) {
    const container = docker.getContainer(containerId);
    try {
      const stats = await container.stats({ stream: false });
      const memoryUsage = stats.memory_stats?.usage || 0;
      const memoryLimit = stats.memory_stats?.limit || 1;
      const ramPercentage = (memoryUsage / memoryLimit) * 100;

      const cpuDelta = (stats.cpu_stats?.cpu_usage?.total_usage || 0) - (stats.precpu_stats?.cpu_usage?.total_usage || 0);
      const systemCpuDelta = (stats.cpu_stats?.system_cpu_usage || 0) - (stats.precpu_stats?.system_cpu_usage || 0);
      const numberCpus = stats.cpu_stats?.online_cpus || 1;
      const cpuPercentage = systemCpuDelta > 0 ? (cpuDelta / systemCpuDelta) * numberCpus * 100 : 0;

      return {
        cpuUsage: cpuPercentage.toFixed(2),
        ramUsageMB: (memoryUsage / (1024 * 1024)).toFixed(2),
        ramPercentage: ramPercentage.toFixed(2),
      };
    } catch (e) {
      return { cpuUsage: '0.00', ramUsageMB: '0.00', ramPercentage: '0.00' };
    }
  }
}
