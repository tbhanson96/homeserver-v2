import { Controller, UseGuards, Get, Query, Post, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UpdateService } from "./update.service";
import { ApiOkResponse, ApiImplicitQuery, ApiImplicitBody } from "@nestjs/swagger";
import { joinRoutes, routes } from "../routes";
import { SettingsDto } from "../models/settingsDto";
import { SettingsService } from "./settings.service";

@Controller(joinRoutes(routes.api, routes.settings))
@UseGuards(AuthGuard('jwt'))
export class SettingsController {

    constructor (
        private readonly updateService: UpdateService,
        private readonly settingsService: SettingsService,
    ) { }

    @Get()
    @ApiOkResponse({ type: SettingsDto, description: 'Server settings found.'})
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Post()
    @ApiOkResponse({ description: 'Successfully set server settings.'})
    setSettings(@Body() settings: SettingsDto) {
        this.settingsService.setSettings(settings);
    }

    @Get('update')
    @ApiOkResponse({ type: String, isArray: true, description: 'Succesfully found updates.' })
    async getPath() {
        return await this.updateService.getUpdates();
    }

    @Post('update')
    @ApiOkResponse({ description: 'Successfully performed update.'})
    @ApiImplicitQuery({ name: 'update', type: String, description: 'Name of package to update app to.' })
    async performUpdate(@Query('update') update: string) {
        await this.updateService.performUpdate(update);
        this.updateService.shutdownApplication(); // don't await this call, return http response before shutdown
    }
}