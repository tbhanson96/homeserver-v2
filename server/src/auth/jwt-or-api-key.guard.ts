import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ApiKeyGuard } from './apikey.guard';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtGuard: JwtGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.configService.config.app.requireAuth) {
      return true;
    }

    try {
      return await this.jwtGuard.canActivate(context);
    } catch {
      return this.apiKeyGuard.canActivate(context);
    }
  }
}
