import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import fs from 'fs';
import path from 'path';
import tar from 'tar';
import { FileUtils } from "../lib/file-utils";

@Injectable()
export class UpdateService implements OnModuleInit {

    private updateDir: string;
    private installDir: string;
    constructor(
        private readonly config: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.updateDir = this.config.env.UPDATES_DIR;
        this.installDir = this.config.env.INSTALL_DIR;
    }


    public async getUpdates() {
        const ret = [];
        let updates = fs.readdirSync(this.updateDir);
        for (let update of updates) {
            if (path.extname(update) !== '.gz') {
                this.log.warn(`Unknown file format found in updates directory: ${update}`);
            } else {
                ret.push(update);
            }
        }
        return ret;
    }

    public async performUpdate(updateFileName: string): Promise<void> {
        const updateFilePath = path.join(this.updateDir, updateFileName);
        if (!fs.existsSync(updateFilePath)) {
            throw new Error(`Update file ${updateFileName} does not exist`);
        }
        await FileUtils.removeDir(this.installDir);
        fs.mkdirSync(this.installDir, { recursive: true });
        await tar.x({
            file: updateFilePath,
            C: this.installDir,
            keep: false,
        });
        this.log.log(`Successfully installed update: ${updateFileName}`);
    }

    public async shutdownApplication(): Promise<void> {
        setTimeout(() => process.exit(0), 3000);
    }
}