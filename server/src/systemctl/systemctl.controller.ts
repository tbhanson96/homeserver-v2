import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { SystemctlActionResultDto, SystemctlUnitActionDto, SystemctlUnitDto } from '../models/systemctl.dto';
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

    @Post('start')
    @ApiBody({ type: SystemctlUnitActionDto, description: 'User systemd service unit to start.' })
    @ApiCreatedResponse({ type: SystemctlActionResultDto, description: 'Started user systemd service unit successfully.' })
    async startUnit(@Body() body: SystemctlUnitActionDto) {
        return await this.systemctlService.startUnit(body.unit);
    }

    @Post('stop')
    @ApiBody({ type: SystemctlUnitActionDto, description: 'User systemd service unit to stop.' })
    @ApiCreatedResponse({ type: SystemctlActionResultDto, description: 'Stopped user systemd service unit successfully.' })
    async stopUnit(@Body() body: SystemctlUnitActionDto) {
        return await this.systemctlService.stopUnit(body.unit);
    }

    @Post('restart')
    @ApiBody({ type: SystemctlUnitActionDto, description: 'User systemd service unit to restart.' })
    @ApiCreatedResponse({ type: SystemctlActionResultDto, description: 'Restarted user systemd service unit successfully.' })
    async restartUnit(@Body() body: SystemctlUnitActionDto) {
        return await this.systemctlService.restartUnit(body.unit);
    }
}
