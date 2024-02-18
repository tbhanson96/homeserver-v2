import { Injectable } from "@nestjs/common";
import { CalibreLibraryData } from "../models/calibreLibraryData";

@Injectable()
export class CalibreService {

    public async addBookToLibrary(filePath: string): Promise<number> { return 0; }

    public async removeBookFromLibrary(id: number): Promise<void> { }

    public async getLibraryData(): Promise<CalibreLibraryData[]> { return []; }
}