import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import fs from 'fs';
import path from 'path';
import tar from 'tar';
import { FileUtils } from "../lib/file-utils";
import { AsyncUtils } from "../lib/async-utils";

@Injectable()
export class UpdateService implements OnModuleInit {

    private updateDir: string;
    private installDir: string;
    private maxUpdatePackages: number;
    constructor(
        private readonly config: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.updateDir = this.config.config.updates.updatesDir;
        this.installDir = this.config.config.updates.installDir;
        this.maxUpdatePackages = this.config.config.updates.limit;
    }

    public async getUpdates() {
        const ret = [];
        try {
            await this.trimUpdatePackagesAsync();
        } catch (e: any) {
            this.log.error(`Failed to trim old update packages from directory.`, e.stack);
        }
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
        this.log.warn('Application shutdown requested, exiting.');
        this.config.saveConfig();
        return new Promise((res, rej) => {
            setTimeout(() => {
                res();
                process.exit(0);
            }, 500);
        });
    }

    private async trimUpdatePackagesAsync(): Promise<void> {
        let packages = await fs.promises.readdir(this.updateDir);
        if (packages.length > this.maxUpdatePackages) {
            packages = packages.sort((p1, p2) => {
                const t1 = fs.statSync(path.join(this.updateDir, p1)).mtimeMs;
                const t2 = fs.statSync(path.join(this.updateDir, p2)).mtimeMs;
                return t2 < t1 ? -1 : 1;
            });
            const packagesToRemove = packages.slice(this.maxUpdatePackages, packages.length);
            await AsyncUtils.forEachAsync(packagesToRemove, async p => {
                await fs.promises.unlink(path.join(this.updateDir, p));
            });
        }
    }
}