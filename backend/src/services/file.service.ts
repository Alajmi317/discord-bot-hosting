import unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';

export class FileService {
  static async extractZipSafely(zipFilePath: string, targetDirectory: string): Promise<void> {
    const resolvedTargetDir = path.resolve(targetDirectory);

    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        const fileName = entry.path;
        const type = entry.type;
        const destPath = path.resolve(resolvedTargetDir, fileName);

        if (!destPath.startsWith(resolvedTargetDir)) {
          entry.autodrain();
          throw new Error('Security Violation: Path Traversal Detected in ZIP file.');
        }

        if (type === 'Directory') {
          fs.mkdirSync(destPath, { recursive: true });
          entry.autodrain();
        } else {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          entry.pipe(fs.createWriteStream(destPath));
        }
      })
      .promise();

    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
  }

  static detectRuntimeAndEntry(botDirectory: string): { runtime: 'NODEJS' | 'PYTHON'; entryPoint: string } {
    const files = fs.readdirSync(botDirectory);

    if (files.includes('package.json')) {
      let entryPoint = 'index.js';
      if (files.includes('bot.js')) entryPoint = 'bot.js';
      if (files.includes('main.js')) entryPoint = 'main.js';
      return { runtime: 'NODEJS', entryPoint };
    }

    if (files.includes('requirements.txt') || files.some(f => f.endsWith('.py'))) {
      let entryPoint = 'main.py';
      if (files.includes('bot.py')) entryPoint = 'bot.py';
      return { runtime: 'PYTHON', entryPoint };
    }

    throw new Error('Unrecognized bot project. Please supply a package.json or requirements.txt file.');
  }
}