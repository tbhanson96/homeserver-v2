import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from '../../src/auth/jwt.guard';

describe('JwtGuard', () => {
  const requestForToken = (token: string): any => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          cookie: `access_token=${token}`,
        },
      }),
    }),
  });

  it('accepts a valid token', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ username: 'user' }),
    } as unknown as JwtService;
    const guard = new JwtGuard(jwtService);

    await expect(guard.canActivate(requestForToken('valid.token'))).resolves.toBe(true);
    expect((jwtService as any).verifyAsync).toHaveBeenCalledWith('valid.token');
  });

  it('rejects an invalid or expired token', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('token expired')),
    } as unknown as JwtService;
    const guard = new JwtGuard(jwtService);

    await expect(guard.canActivate(requestForToken('expired.token'))).rejects.toThrow(UnauthorizedException);
  });
});
