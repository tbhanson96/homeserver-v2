import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { AuthDto } from '../models/auth.dto';
import { AuthService } from './auth.service';
import { CookieOptions, Request } from 'express';
import { ApiCreatedResponse, ApiProduces, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from './jwt.guard';

const SIX_MONTHS_IN_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SIX_MONTHS_IN_MS,
};

const CLEAR_ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
};

@Controller(joinRoutes(routes.api, routes.auth))
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiProduces('text/html')
    @ApiCreatedResponse({ description: 'Successfully logged in', type: String })
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async login(@Body() authDto: AuthDto, @Req() request: Request) {
        const authed = await this.authService.authenticate(authDto.username, authDto.password);
        if (authed) {
            const token = await this.authService.authorize(authDto.username);
            if (request.res) {
                request.res.clearCookie('access_token', CLEAR_ACCESS_TOKEN_COOKIE_OPTIONS);
                request.res.cookie('access_token', token, ACCESS_TOKEN_COOKIE_OPTIONS);
            }
            return token;
        } else {
            return '';
        }
    }

    @Get()
    @UseGuards(JwtGuard)
    isLoggedIn() {
        return true;
    }
}
