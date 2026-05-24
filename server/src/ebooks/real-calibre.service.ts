import { Injectable, Logger } from "@nestjs/common";
import { Calibre } from 'node-calibre';
import { CalibreService } from "./calibre.service";
import { CalibreLibraryData } from "../models/calibreLibraryData";
import path from "path";
import { existsSync } from "fs";
import { routes } from "../routes";

@Injectable()
export class RealCalibreService implements CalibreService {

    constructor(
        private readonly calibre: Calibre,
        private readonly libraryPath: string,
        private readonly log: Logger,
        private readonly libraryName: string = routes.ebooks,
    ) { }

    public async addBookToLibrary(filePath: string): Promise<number> {
        return this.getCalibreIdFromAddResult(
            await this.calibre.run('calibredb add', [filePath], this.getLibraryOptions()),
        );
    }

    public async removeBookFromLibrary(id: number): Promise<void> {
        await this.calibre.run('calibredb remove --permanent', [id], this.getLibraryOptions());
        this.log.log(`Succesfully removed book ${id} from library.`);
    }

    public async getLibraryData(): Promise<CalibreLibraryData[]> {
        const result = await this.calibre.run('calibredb list --for-machine -f all', [], this.getLibraryOptions());
        const data: CalibreLibraryData[] = JSON.parse(result);
        data.forEach(d => {
            d.cover = existsSync(d.cover)
                ? `${this.libraryName}/${path.relative(this.libraryPath, d.cover)}`
                : '';
        });
        return data;
    }

    private getLibraryOptions() {
        return { libraryPath: this.libraryPath };
    }

    private getCalibreIdFromAddResult(result: string): number {
        return parseInt(result.slice(result.indexOf(': ') + 1, result.length));
    }
}
