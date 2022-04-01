import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { SettingsDto } from "../models/settings.dto";

@Injectable()
export class SettingsService implements OnModuleInit {

    private settings: SettingsDto;
    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.settings = {
            showHiddenFiles: this.configService.config.files.showHidden,
            useDarkMode: this.configService.config.ui.darkMode,
        };
    }

    public getSettings(): SettingsDto {
        return this.settings;
    }

    public setSettings(settings: SettingsDto) {
        this.settings = settings;
        this.configService.config.ui.darkMode = settings.useDarkMode;
        this.configService.config.files.showHidden = settings.showHiddenFiles;
        this.configService.saveConfig();
        this.log.log(`Updated server settings: ${JSON.stringify(settings)}`);
    }
}