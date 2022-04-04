import { Controller, UseGuards, Get, Query, Post, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UpdateService } from "./update.service";
import { ApiAcceptedResponse, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { joinRoutes, routes } from "../routes";
import { SettingsDto } from "../models/settings.dto";
import { SettingsService } from "./settings.service";

@Controller(joinRoutes(routes.api, routes.settings))
export class SettingsController {

    constructor (
        private readonly updateService: UpdateService,
        private readonly settingsService: SettingsService,
    ) { }

    @Get() // no auth on this call so dark mode can be applied on login screen
    @ApiOkResponse({ type: SettingsDto, description: 'Server settings found.'})
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ description: 'Successfully set server settings.'})
    setSettings(@Body() settings: SettingsDto) {
        this.settingsService.setSettings(settings);
    }

    @Get('update')
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({ type: String, isArray: true, description: 'Succesfully found updates.' })
    async getPath() {
        return await this.updateService.getUpdates();
    }

    @Post('update')
    @UseGuards(AuthGuard('jwt'))
    @ApiAcceptedResponse({ description: 'Server shutdown and update in progress.'})
    performUpdate() {
        this.updateService.shutdownApplication(); // don't await this call, return http response before shutdown
    }
}