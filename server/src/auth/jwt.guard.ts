import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    try {
      const token = this.extractTokenFromHeader(req);
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          ignoreExpiration: true,
        },
      );
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
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