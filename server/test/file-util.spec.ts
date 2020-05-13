jest.mock('fs', () => {
  return require('memfs').fs;
});
import fs from 'fs';
import path from 'path';
import { setupMockFs } from './mock-helper';
import { FileUtils } from '../src/lib/file-utils';

describe('FileUtil', () => {

    const rootPath = path.join(__dirname, 'testDirectory');

    beforeEach(() => {
        setupMockFs();
        fs.mkdirSync(rootPath, { recursive: true });
        fs.writeFileSync(path.join(rootPath, 'test.txt'), 'sdjk');
        fs.mkdirSync(path.join(rootPath, 'folder'));
        fs.writeFileSync(path.join(rootPath, 'folder', 'test2.txt'), 'sdklf');
    });

    it('removeDir works as expected', async () => {
        expect(fs.existsSync(rootPath)).toBeTruthy();
        await FileUtils.removeDir(rootPath);
        expect(fs.existsSync(rootPath)).toBeFalsy();
    });
});