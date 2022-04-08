import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { AuthDto } from '../models/auth.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiCreatedResponse, ApiProduces, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
                request.res.clearCookie('access_token', { httpOnly: true, sameSite: true });
                request.res.cookie('access_token', token, { httpOnly: true, sameSite: true });
            }
            return token;
        } else {
            return '';
        }
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    isLoggedIn() {
        return true;
    }
}
