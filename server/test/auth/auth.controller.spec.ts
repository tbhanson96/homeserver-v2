jest.mock( '../../src/auth/auth.service');
jest.mock('express')
import { request } from 'express';
import { AuthService } from '../../src/auth/auth.service';
import { AuthController } from '../../src/auth/auth.controller';

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
            expect(service.authenticate).toBeCalled();
            expect(authorize).toBeCalled();
            authorize.mockClear();
            jest.spyOn(service, 'authenticate').mockReturnValue(false);
            await controller.login({username: '', password: ''}, request);
            expect(service.authenticate).toBeCalled();
            expect(authorize).not.toBeCalled();
        });

        it('should return token', async () => {
            jest.spyOn(service, 'authenticate').mockReturnValue(true);
            jest.spyOn(service, 'authorize').mockReturnValue('token');
            const token = await controller.login({username: '', password: ''}, request);
            expect(token).toEqual('token');
        })

    });
});