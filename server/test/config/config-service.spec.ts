jest.mock('fs', () => {
  return require('memfs').fs;
});
import { setupMockFs } from '../mock-helper';
import { ConfigService } from '../../src/config/config.service';
import Config from '../../src/config/config.default.json';
import ProdConfig from '../../src/config/config.prod.json';
import path from 'path';
import jsonfile from 'jsonfile';
import { flatten } from 'flat';

describe('ConfigService', () => {

    const defaultConfigPath = '../../src/config/config.default.json';

    beforeAll(() => {
        setupMockFs();
    });

    afterAll(() => {
        jest.unmock('fs');
    });

    it('dummy-check prod and default keys', async () => {
        const defaultFlat = flatten<any, any>(Config);
        const prodFlat = flatten<any, any>(ProdConfig);
        Object.keys(defaultFlat).forEach(defaultKey => {
            expect(prodFlat[defaultKey]).toBeDefined();
        });
    });

    it('loads default', async () => {
        const port = Config.app.port;
        const config = new ConfigService();
        expect(config.config.app.port).toEqual(port);
    });

    it('loads override file', async () => {
        const port = 12312;
        await jsonfile.writeFile('config.json', { app: { port }});

        const mockedConfig = Config;
        mockedConfig.app.configOverridePath = 'config.json';
        jest.mock(defaultConfigPath, () => {
            return mockedConfig;
        });
        const config = new ConfigService();
        expect(config.config.app.port).toEqual(port);
        jest.unmock(defaultConfigPath);
    });

    it('loads env', () => {
        const email = "myEmail@fake.com";
        process.env['APP_email_sender'] = `${email}`;
        const config = new ConfigService();
        expect(config.config.email.sender).toEqual(email);
    });

    it('loads env and override', async () => {

        const port = 12345;
        process.env['APP_app_configOverridePath'] = 'config.json';

        await jsonfile.writeFile('config.json', { app: { port }});
        const config = new ConfigService();
        expect(config.config.app.port).toEqual(port);
    })

    it('replaces wildcard for default config', async () => {
        const filesDir = path.resolve(__dirname, path.dirname(defaultConfigPath), 'files');
        const mockedConfig = Config;
        mockedConfig.files.homeDir = '{.}/files';
        jest.mock(defaultConfigPath, () => {
            return mockedConfig;
        });
        const config = new ConfigService();
        expect(config.config.files.homeDir).toEqual(filesDir);
        jest.unmock(defaultConfigPath);
    });

    it('replaces wildcard for override config', async () => {
        const mockedConfig = Config;
        mockedConfig.app.configOverridePath = path.resolve('config.json');
        jest.mock(defaultConfigPath, () => {
            return mockedConfig;
        });

        const filesDir = path.resolve('files');
        await jsonfile.writeFile('config.json', { files: { homeDir: '{.}/files' }})

        const config = new ConfigService();
        expect(config.config.files.homeDir).toEqual(filesDir);
        jest.unmock(defaultConfigPath);
    });

    it('saves file', async () => {
        const config = new ConfigService();
        config.config.app.configOverridePath = 'config.json';
        config.saveConfig();
        const json = await jsonfile.readFile('config.json');
        expect(json).toStrictEqual(config.config); 
    });
});