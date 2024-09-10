import { Controller, Post, Body, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/apikey.guard';

@Controller(joinRoutes(routes.api, routes.health))
@UseGuards(ApiKeyGuard)
export class HealthController {

    constructor(private readonly logger: Logger) { }

    @Post()
    @ApiCreatedResponse({ description: 'Succesfully uploaded health data'})
    @ApiBody({ type: Object })
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async login(@Body() healthData: any) {
      this.logger.log("Received health data.");
      this.logger.log(JSON.stringify(healthData));
    }

    @Get()
    @ApiOkResponse({ description: 'success'})
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    isLoggedIn() {
      return true;
    }
}
