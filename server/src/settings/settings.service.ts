import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { SettingsDto } from "../models/settings.dto";

@Injectable()
export class SettingsService {

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    public getSettings(): SettingsDto {
        return {
            useDarkMode: this.configService.config.ui.darkMode,
            showHiddenFiles: this.configService.config.files.showHidden,
        };
    }

    public setSettings(settings: SettingsDto) {
        this.configService.config.ui.darkMode = settings.useDarkMode;
        this.configService.config.files.showHidden = settings.showHiddenFiles;
        this.configService.saveConfig();
        this.log.log(`Updated server settings: ${JSON.stringify(settings)}`);
    }
}