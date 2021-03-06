jest.mock('dotenv');
import * as dotenv from 'dotenv';
import { ConfigService } from '../../src/services/config.service';

describe('ConfigService', () => {

    let mockDotEnv = <any>dotenv;
    beforeEach(() => {
        jest.spyOn(mockDotEnv, 'config').mockImplementation(() => {
            process.env = {...process.env, FILES_DIR: '{.}/..', PORT: '6969' };
        });
    });

    it('parses into process.env correctly', () => {
        const service = new ConfigService('path/default.env');
        expect(mockDotEnv.config).toBeCalled();
        expect(service.env.FILES_DIR).toEqual('path/..')
        expect(service.env.PORT).toEqual('6969');
    });

    it('throws if env does not find key', () => {
        const service = new ConfigService('path/default.env');
        expect(() => {
            service.env.NOT_A_KEY
        }).toThrow();
    });
});