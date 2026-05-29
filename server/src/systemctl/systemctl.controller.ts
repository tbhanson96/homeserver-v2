import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { SystemctlActionResultDto, RestartSystemctlUnitDto, SystemctlUnitDto } from '../models/systemctl.dto';
import { joinRoutes, routes } from '../routes';
import { SystemctlService } from './systemctl.service';

@Controller(joinRoutes(routes.api, routes.systemctl))
@UseGuards(JwtGuard)
export class SystemctlController {

    constructor(
        private readonly systemctlService: SystemctlService,
    ) { }

    @Get()
    @ApiOkResponse({ type: SystemctlUnitDto, isArray: true, description: 'Retrieved user systemd service units successfully.' })
    async listUnits() {
        return await this.systemctlService.listUnits();
    }

    @Post('restart')
    @ApiBody({ type: RestartSystemctlUnitDto, description: 'User systemd service unit to restart.' })
    @ApiCreatedResponse({ type: SystemctlActionResultDto, description: 'Restarted user systemd service unit successfully.' })
    async restartUnit(@Body() body: RestartSystemctlUnitDto) {
        return await this.systemctlService.restartUnit(body.unit);
    }
}
