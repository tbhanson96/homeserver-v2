import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { Calibre } from 'node-calibre';
import { CalibreService } from "./calibre.service";
import { CalibreLibraryData } from "../models/calibreLibraryData";
import path from "path";
import { existsSync } from "fs";
import { routes } from "../routes";

@Injectable()
export class RealCalibreService implements OnModuleInit, CalibreService {

    private libraryPath: string;
    private calibre: Calibre;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.libraryPath = this.configService.config.ebooks.homeDir;
        this.calibre = new Calibre({ library: this.libraryPath })
    }

    public async addBookToLibrary(filePath: string): Promise<number> {
        return this.getCalibreIdFromAddResult(await this.calibre.run('calibredb add', [filePath]));
    }

    public async removeBookFromLibrary(id: number): Promise<void> {
        await this.calibre.run('calibredb remove --permanent', [id]);
        this.log.log(`Succesfully removed book ${id} from library.`);
    }

    public async getLibraryData(): Promise<CalibreLibraryData[]> {
        const result = await this.calibre.run('calibredb list --for-machine -f all');
        const data: CalibreLibraryData[] = JSON.parse(result);
        data.forEach(d => {
            d.cover = existsSync(d.cover)
                ? `${routes.ebooks}/${path.relative(this.libraryPath, d.cover)}`
                : '';
        });
        return data;
    }

    private getCalibreIdFromAddResult(result: string): number {
        return parseInt(result.slice(result.indexOf(': ') + 1, result.length));
    }
}