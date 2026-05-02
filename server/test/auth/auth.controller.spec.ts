jest.mock( '../../src/auth/auth.service');
jest.mock('express')
import { request } from 'express';
import { AuthService } from '../../src/auth/auth.service';
import { ACCESS_TOKEN_COOKIE_OPTIONS, AuthController } from '../../src/auth/auth.controller';

describe('AuthController', () => {

    const authService = <jest.Mock<AuthService>>AuthService;
    let controller: AuthController;
    let service: any;
    beforeEach(() => {
        authService.mockClear();
        controller = new AuthController(new authService());
        service = authService.mock.instances[0];
    });

    describe('login', () => {
        it('should call correct methods', async () => {
            jest.spyOn(service, 'authenticate').mockReturnValue(true);
            const authorize = jest.spyOn(service, 'authorize');
            await controller.login({username: '', password: ''}, request);
            expect(service.authenticate).toHaveBeenCalled();
            expect(authorize).toHaveBeenCalled();
            authorize.mockClear();
            jest.spyOn(service, 'authenticate').mockReturnValue(false);
            await controller.login({username: '', password: ''}, request);
            expect(service.authenticate).toHaveBeenCalled();
            expect(authorize).not.toHaveBeenCalled();
        });

        it('should return token', async () => {
            jest.spyOn(service, 'authenticate').mockReturnValue(true);
            jest.spyOn(service, 'authorize').mockReturnValue('token');
            const token = await controller.login({username: '', password: ''}, request);
            expect(token).toEqual('token');
        })

        it('should set a persistent access token cookie', async () => {
            const res = {
                clearCookie: jest.fn(),
                cookie: jest.fn(),
            };
            const requestWithResponse = { res } as any;
            jest.spyOn(service, 'authenticate').mockReturnValue(true);
            jest.spyOn(service, 'authorize').mockReturnValue('token');

            await controller.login({username: '', password: ''}, requestWithResponse);

            expect(res.clearCookie).toHaveBeenCalledWith('access_token', {
                httpOnly: true,
                sameSite: 'lax',
            });
            expect(res.cookie).toHaveBeenCalledWith('access_token', 'token', ACCESS_TOKEN_COOKIE_OPTIONS);
            expect(ACCESS_TOKEN_COOKIE_OPTIONS.maxAge).toEqual(1000 * 60 * 60 * 24 * 30 * 6);
        })

    });
});
