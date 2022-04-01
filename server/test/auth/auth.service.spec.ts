jest.mock( '../../src/config/config.service');
jest.mock('@nestjs/jwt');
import { ConfigService } from '../../src/config/config.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    const MockConfigService = <any>ConfigService;
    const MockJwtService = <any>JwtService;

    beforeEach(() => {
        MockConfigService.mockClear();
        MockJwtService.mockClear();
        MockConfigService.mockImplementation(() => {
            return { config: { auth: { username: 'u', password: 'p' } } }
        })
        authService = new AuthService(new MockJwtService(), new MockConfigService());
    });

    describe('authenticate', () => {
        it('returns correct values', async () => {
          const res = await authService.authenticate('u', 'p');
          expect(res).toBeTruthy();
          expect(authService.authenticate('not u', 'not p')).rejects.toThrow(UnauthorizedException);
        });
    });
});