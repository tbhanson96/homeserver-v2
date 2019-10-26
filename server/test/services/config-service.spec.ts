jest.mock('dotenv');
import * as dotenv from 'dotenv';
import { ConfigService } from '../../src/services/config.service';

describe('ConfigService', () => {

    let mockDotEnv = <any>dotenv;
    beforeEach(() => {
        jest.spyOn(mockDotEnv, 'config').mockImplementation(() => {
            process.env = {...process.env, ROOT_DIR: '{.}/..', PORT: '6969' };
        });
    });

    it('parses into process.env correctly', () => {
        const service = new ConfigService('path');
        expect(mockDotEnv.config).toBeCalled();
        expect(service.env.ROOT_DIR).toEqual('path/..')
        expect(service.env.PORT).toEqual('6969');
    });

    it('throws if env does not find key', () => {
        const service = new ConfigService('path');
        expect(() => {
            service.env.NOT_A_KEY
        }).toThrow();
    });
});