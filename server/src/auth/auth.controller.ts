import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { AuthDto } from '../models/authDto';
import { AuthService } from './auth.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller(joinRoutes(routes.api, routes.auth))
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiOkResponse({ description: "Successfully logged in", type: String })
    async login(@Body() authDto: AuthDto) {
        const authed = await this.authService.authenticate(authDto.username, authDto.password);
        if (authed) {
            return await this.authService.authorize(authDto.username);
        }
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    isLoggedIn() {
        return true;
    }
}
