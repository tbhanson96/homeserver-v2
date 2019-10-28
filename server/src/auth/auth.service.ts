import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../services/config.service';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async authenticate(username: string, password: string): Promise<boolean> {
        try {
            const localUsername = Buffer.from(this.configService.env.APP_USER);
            const localPassword = Buffer.from(this.configService.env.APP_PASSWORD);
            const isUserEqual = timingSafeEqual(localUsername, Buffer.from(username));
            const isPasswordEqual = timingSafeEqual(localPassword, Buffer.from(password));
            return isUserEqual && isPasswordEqual;
        } catch(e) {
            throw new UnauthorizedException();
        }
    }

    async authorize(username: string) {
        const payload = { username } ;
        return this.jwtService.sign(payload)
    }

}
