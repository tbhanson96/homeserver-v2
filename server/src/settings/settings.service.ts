
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { SettingsDto } from "../models/settingsDto";

@Injectable()
export class SettingsService implements OnModuleInit {

    private settings: SettingsDto;
    constructor(
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.settings = {
            showHiddenFiles: false,
        };
    }

    public getSettings(): SettingsDto {
        return this.settings;
    }

    public setSettings(settings: SettingsDto) {
        this.settings = settings;
        this.log.log(`Updated server settings: ${settings.showHiddenFiles}`);
    }
}