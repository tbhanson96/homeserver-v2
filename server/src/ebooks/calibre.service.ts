import { Injectable } from "@nestjs/common";
import { CalibreLibraryData } from "../models/calibreLibraryData";

@Injectable()
export class CalibreService {

    public async addBookToLibrary(filePath: string): Promise<number> {
        throw new Error('App module configured incorrectly');
    }

    public async removeBookFromLibrary(id: number): Promise<void> {
        throw new Error('App module configured incorrectly');
    }

    public async getLibraryData(): Promise<CalibreLibraryData[]> {
        throw new Error('App module configured incorrectly');
    }
}