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
        const data = this.parseLibraryData(result);
        data.forEach(d => {
            d.cover = typeof d.cover === 'string' && existsSync(d.cover)
                ? `${this.libraryName}/${path.relative(this.libraryPath, d.cover)}`
                : '';
        });
        return data;
    }

    private parseLibraryData(result: string): CalibreLibraryData[] {
        try {
            return JSON.parse(result) as CalibreLibraryData[];
        } catch (parseError) {
            const jsonEnd = this.findJsonArrayEnd(result);
            if (jsonEnd === -1) {
                throw parseError;
            }

            const trailingOutput = result.slice(jsonEnd);
            if (!trailingOutput.trim()) {
                throw parseError;
            }

            const data = JSON.parse(result.slice(0, jsonEnd)) as CalibreLibraryData[];
            this.log.warn(`Ignored ${trailingOutput.length} trailing character(s) from calibredb list output.`);
            return data;
        }
    }

    private findJsonArrayEnd(result: string): number {
        let index = 0;
        while (/\s/.test(result[index] || '')) {
            index++;
        }
        if (result[index] !== '[') {
            return -1;
        }

        let depth = 0;
        let inString = false;
        let escaped = false;
        for (; index < result.length; index++) {
            const character = result[index];
            if (inString) {
                if (escaped) {
                    escaped = false;
                } else if (character === '\\') {
                    escaped = true;
                } else if (character === '"') {
                    inString = false;
                }
                continue;
            }

            if (character === '"') {
                inString = true;
            } else if (character === '[' || character === '{') {
                depth++;
            } else if (character === ']' || character === '}') {
                depth--;
                if (depth === 0) {
                    return index + 1;
                }
            }
        }
        return -1;
    }

    private getLibraryOptions() {
        return { libraryPath: this.libraryPath };
    }

    private getCalibreIdFromAddResult(result: string): number {
        return parseInt(result.slice(result.indexOf(': ') + 1, result.length));
    }
}
