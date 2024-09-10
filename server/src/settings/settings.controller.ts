import { Controller, UseGuards, Get, Query, Post, Body, Put } from "@nestjs/common";
import { UpdateService } from "./update.service";
import { ApiAcceptedResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { joinRoutes, routes } from "../routes";
import { SettingsDto } from "../models/settings.dto";
import { SettingsService } from "./settings.service";
import { ConfigService } from '../config/config.service';
import { FileData } from "../models/fileData.dto";
import { FileService } from "../files/file.service";
import { JwtGuard } from "../auth/jwt.guard";

@Controller(joinRoutes(routes.api, routes.settings))
export class SettingsController {

    constructor (
        private readonly updateService: UpdateService,
        private readonly configService: ConfigService,
        private readonly fileService: FileService,
        private readonly settingsService: SettingsService,
    ) { }

    @Get() // no auth on this call so dark mode can be applied on login screen
    @ApiOkResponse({ type: SettingsDto, description: 'Server settings found.'})
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Post()
    @UseGuards(JwtGuard)
    @ApiCreatedResponse({ description: 'Successfully set server settings.'})
    setSettings(@Body() settings: SettingsDto) {
        this.settingsService.setSettings(settings);
    }

    @Put()
    @UseGuards(JwtGuard)
    @ApiOkResponse({ description: 'Successfully reloaded server settings file.'})
    @ApiBody({ type: FileData, required: false, description: 'Config file to load'})
    reloadSettings(@Body() config?: FileData) {
        if (config?.link) {
            const localPath = this.fileService.getLocalFilePath(config.link);
            this.configService.loadConfig(localPath);
        }
        this.configService.loadConfig(this.configService.config.app.configOverridePath);
    }

    @Get('update')
    @UseGuards(JwtGuard)
    @ApiOkResponse({ type: String, isArray: true, description: 'Succesfully found updates.' })
    async getPath() {
        return await this.updateService.getUpdates();
    }

    @Post('update')
    @UseGuards(JwtGuard)
    @ApiAcceptedResponse({ description: 'Server shutdown and update in progress.'})
    performUpdate() {
        this.updateService.shutdownApplication(); // don't await this call, return http response before shutdown
    }
}