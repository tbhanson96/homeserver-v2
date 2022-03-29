import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import { Calibre } from 'node-calibre';
import { CalibreService } from "./calibre.service";
import { CalibreLibraryData } from "../models/calibreLibraryData";
import { FileUtils } from "../lib/file-utils";
import fs from 'fs';

@Injectable()
export class RealCalibreService implements OnModuleInit, CalibreService {

    private libraryPath: string;
    private calibre: Calibre;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.libraryPath = this.configService.env.EBOOK_DIR;
        this.calibre = new Calibre({ library: this.libraryPath })
    }

    public async addBookToLibrary(filePath: string): Promise<number> {
        return this.getCalibreIdFromAddResult(await this.calibre.run('calibredb add', [filePath]));
    }

    public async addBookFormatToLibrary(id: number, filePath: string): Promise<void> {
        await this.calibre.run('calibredb add_format', [id, filePath]);
    }

    public async convertToMobi(filepath: string): Promise<string> {
        const mobiPath = FileUtils.changeExt(filepath, 'mobi');
        let e;
        try {
            await this.calibre.run('ebook-convert', [filepath, FileUtils.changeExt(filepath, 'mobi')]);
        }
        catch (e) {
            this.log.warn(`Error encountered during ebook-convert: ${e}`);
            e = e;
        }
        if (fs.existsSync(mobiPath)) {
            this.log.log(`Succesfully converted ${filepath} to ${mobiPath}`);
            return mobiPath;
        }
        else throw new Error(`Could not create mobi file: ${e}`);
    }

    public async removeBookFromLibrary(id: number): Promise<void> {
        await this.calibre.run('calibredb remove', [id]);
        this.log.log(`Succesfully removed book ${id} from library.`);
    }

    public async getLibraryData(): Promise<CalibreLibraryData[]> {
        const result = await this.calibre.run('calibredb list --for-machine');
        return JSON.parse(result);
    }

    private getCalibreIdFromAddResult(result: string): number {
        return parseInt(result.slice(result.indexOf(': ') + 1, result.length));
    }
}