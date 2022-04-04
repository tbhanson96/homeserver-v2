import fs from 'fs';
import { IFs } from 'memfs';
import path from 'path';
import { ConfigService } from "../src/config/config.service";
const realFs: IFs = jest.requireActual('fs');

export function setupMockFs(...filesToMock: string[]): void {
    const config = new ConfigService();
    fs.mkdirSync(process.cwd(), { recursive: true });
    fs.mkdirSync(config.config.files.homeDir, { recursive: true });
    fs.mkdirSync(config.config.app.clientDir, { recursive: true });
    fs.mkdirSync(config.config.ebooks.homeDir, { recursive: true });
    fs.mkdirSync(config.config.updates.updatesDir, { recursive: true });
    fs.mkdirSync(config.config.updates.installDir, { recursive: true });
    fs.mkdirSync(config.config.files.uploadDir, { recursive: true });

    filesToMock.forEach(f => {
        fs.mkdirSync(path.dirname(f), { recursive: true });
        const contents = realFs.readFileSync(f);
        fs.writeFileSync(f, contents);
    });
}
