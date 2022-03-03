import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { AuthDto } from '../models/auth.dto';
import { AuthService } from './auth.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller(joinRoutes(routes.api, routes.auth))
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiOkResponse({ description: "Successfully logged in", type: String })
    async login(@Body() authDto: AuthDto, @Req() request: Request) {
        const authed = await this.authService.authenticate(authDto.username, authDto.password);
        if (authed) {
            const token = await this.authService.authorize(authDto.username);
            if (request.res) {
                request.res.clearCookie('access_token', { httpOnly: true, sameSite: true });
                request.res.cookie('access_token', token, { httpOnly: true, sameSite: true });
            }
            return token;
        }
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    isLoggedIn() {
        return true;
    }
}
