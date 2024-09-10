import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) { }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    try {
      const token = this.extractTokenFromHeader(req);
      const apiKeys = this.configService.config.auth.apiKeys;
      if (apiKeys.includes(token)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string {
    if (request.headers.cookie) {
      const cookie = request.headers.cookie;
      const indexStart = cookie.indexOf('access_token=') + 'access_token='.length;
      const indexEnd = cookie.indexOf(';', indexStart);
      return request.headers.cookie.substring(indexStart, indexEnd === -1 ? undefined : indexEnd);
    } else {
      return '';
    }
  }
}