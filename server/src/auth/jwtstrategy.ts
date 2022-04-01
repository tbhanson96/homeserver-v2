import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req.headers.cookie) {
            const cookie = req.headers.cookie;
            const indexStart = cookie.indexOf('access_token=') + 'access_token='.length;
            const indexEnd = cookie.indexOf(';', indexStart);
            return req.headers.cookie.substring(indexStart, indexEnd === -1 ? undefined : indexEnd);
          } else {
            return '';
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.config.auth.jwtSecret,
    });
  }

  async validate(payload: any) {
    return { username: payload.username };
  }
}