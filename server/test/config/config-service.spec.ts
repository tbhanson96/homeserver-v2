jest.mock('fs', () => {
  return require('memfs').fs;
});
import fs from 'fs';
import { setupMockFs } from '../mock-helper';
import { ConfigService } from '../../src/config/config.service';

describe('ConfigService', () => {
    beforeAll(() => {
        setupMockFs();
    });

    it('loads file correctly', async () => {
        const port = 12312;
        await fs.promises.writeFile('config.json', `{ "app": { "port": ${port} }}`);
        const config = new ConfigService();
        config.loadConfig('config.json');
        expect(config.config.app.port).toEqual(port);
    });

    it('loads env correctly', () => {
        const email = "myEmail@fake.com";
        process.env['APP_email_sender'] = `${email}`;
        const config = new ConfigService();
        expect(config.config.email.sender).toEqual(email);
    });

    it('saves file correctly', async () => {
        const config = new ConfigService();
        config.config.app.configOverridePath = 'config.json';
        config.saveConfig();
        const contents = await fs.promises.readFile('config.json');
        const json = JSON.parse(contents.toString());
        expect(json).toStrictEqual(config.config); 
    });

});