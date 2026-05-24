import { ApiKeyGuard } from '../../src/auth/apikey.guard';
import { ConfigService } from '../../src/config/config.service';

describe('ApiKeyGuard', () => {
  const contextWithHeaders = (headers: Record<string, string>): any => ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  });

  it('accepts an API key in the x-api-key header', async () => {
    const configService = {
      config: { auth: { apiKeys: ['automated-upload-key'] } },
    } as ConfigService;
    const guard = new ApiKeyGuard(configService);

    await expect(
      guard.canActivate(contextWithHeaders({ 'x-api-key': 'automated-upload-key' })),
    ).resolves.toBe(true);
  });

  it('accepts an API key as a bearer token', async () => {
    const configService = {
      config: { auth: { apiKeys: ['automated-upload-key'] } },
    } as ConfigService;
    const guard = new ApiKeyGuard(configService);

    await expect(
      guard.canActivate(contextWithHeaders({ authorization: 'Bearer automated-upload-key' })),
    ).resolves.toBe(true);
  });
});
