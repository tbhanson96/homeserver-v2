
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { SettingsDto } from "../models/settings.dto";

@Injectable()
export class SettingsService implements OnModuleInit {

    private settings: SettingsDto;
    constructor(
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.settings = {
            showHiddenFiles: false,
            useDarkMode: false,
        };
    }

    public getSettings(): SettingsDto {
        return this.settings;
    }

    public setSettings(settings: SettingsDto) {
        this.settings = settings;
        this.log.log(`Updated server settings: ${JSON.stringify(settings)}`);
    }
}