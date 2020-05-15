import { Injectable } from "@nestjs/common";
import { CalibreLibraryData } from "src/models/calibreLibraryData";

@Injectable()
export class CalibreService {

    public async addBookToLibrary(filePath: string): Promise<number> { return 0; }

    public async addBookFormatToLibrary(id: number, filePath: string): Promise<void> { }

    public async convertToMobi(filepath: string): Promise<string> { return ''; }

    public async removeBookFromLibrary(id: number): Promise<void> { }

    public async getLibraryData(): Promise<CalibreLibraryData[]> { return []; }
}