jest.mock( '../../src/config/config.service');
jest.mock('@nestjs/jwt');
import { ConfigService } from '../../src/config/config.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    let configService: any;
    let jwtService: any;
    const MockConfigService = <any>ConfigService;
    const MockJwtService = <any>JwtService;

    beforeEach(() => {
        MockConfigService.mockClear();
        MockJwtService.mockClear();
        MockConfigService.mockImplementation(() => {
            return {
                config: { auth: { username: 'u', password: 'p', sessionTimeout: '5m' } },
                saveConfig: jest.fn(),
            }
        })
        MockJwtService.mockImplementation(() => {
            return { sign: jest.fn().mockReturnValue('signed.jwt.token') };
        });
        configService = new MockConfigService();
        jwtService = new MockJwtService();
        authService = new AuthService(jwtService, configService);
    });

    describe('authenticate', () => {
        it('returns correct values', async () => {
          const res = await authService.authenticate('u', 'p');
          expect(res).toBeTruthy();
          expect(authService.authenticate('not u', 'not p')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('authorize', () => {
        it('persists the signing secret after issuing a session token', async () => {
            const token = await authService.authorize('u');

            expect(token).toEqual('signed.jwt.token');
            expect(jwtService.sign).toHaveBeenCalledWith(
                { username: 'u' },
                { expiresIn: '5m' },
            );
            expect(configService.saveConfig).toHaveBeenCalled();
        });
    });
});
