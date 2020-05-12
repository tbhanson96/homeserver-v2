import { appConstants } from "../src/constants";
import fs from 'fs';
import path from 'path';
import { ConfigService } from "../src/services/config.service";
const realFs = jest.requireActual('fs');

export function setupMockFs(...filesToMock: string[]): ConfigService {
    const envFileContents = realFs.readFileSync(appConstants.envFilePath);
    fs.mkdirSync(path.dirname(appConstants.envFilePath), { recursive: true });
    fs.writeFileSync(appConstants.envFilePath, envFileContents);
    const config = new ConfigService(appConstants.envFilePath);
    fs.mkdirSync(config.env.FILES_DIR, { recursive: true });
    fs.mkdirSync(config.env.CLIENT_DIR, { recursive: true });
    fs.mkdirSync(config.env.EBOOK_DIR, { recursive: true });
    fs.mkdirSync(config.env.UPDATES_DIR, { recursive: true });
    fs.mkdirSync(config.env.INSTALL_DIR, { recursive: true });
    fs.mkdirSync(config.env.FILE_UPLOAD_DEST, { recursive: true });

    filesToMock.forEach(f => {
        fs.mkdirSync(path.dirname(f), { recursive: true });
        const contents = realFs.readFileSync(f);
        fs.writeFileSync(f, contents);
    });
    return config;
}