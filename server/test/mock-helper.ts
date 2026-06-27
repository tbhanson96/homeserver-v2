import fs from 'fs';
import { IFs } from 'memfs';
import path from 'path';
import { ConfigService } from "../src/config/config.service";
const realFs: IFs = jest.requireActual('fs');
const sqlitePackageJson = require.resolve('better-sqlite3/package.json');

export function setupMockFs(...filesToMock: string[]): void {
    process.env['APP_db_path'] = ':memory:';
    const config = new ConfigService();
    fs.mkdirSync(process.cwd(), { recursive: true });
    fs.mkdirSync(config.config.files.homeDir, { recursive: true });
    fs.mkdirSync(config.config.app.clientDir, { recursive: true });
    fs.mkdirSync(config.config.ebooks.homeDir, { recursive: true });
    fs.mkdirSync(config.config.newspapers.homeDir, { recursive: true });
    fs.mkdirSync(config.config.updates.updatesDir, { recursive: true });
    fs.mkdirSync(config.config.updates.installDir, { recursive: true });
    fs.mkdirSync(config.config.files.uploadDir, { recursive: true });

    fs.mkdirSync(path.dirname(sqlitePackageJson), { recursive: true });
    fs.writeFileSync(sqlitePackageJson, realFs.readFileSync(sqlitePackageJson));

    filesToMock.forEach(f => {
        fs.mkdirSync(path.dirname(f), { recursive: true });
        const contents = realFs.readFileSync(f);
        fs.writeFileSync(f, contents);
    });
}
