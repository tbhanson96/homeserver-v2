import path from 'path';
import fs from 'fs';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CalibreService } from './calibre.service';
import { ConfigService } from '../config/config.service';
import { EbookUtils } from '../lib/ebook-utils';
import { CalibreLibraryData } from '../models/calibreLibraryData';

@Injectable()
export class StubCalibreService implements CalibreService, OnModuleInit {

    private libraryPath: string;

    private books: string[] = [];
    private curId = 0;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    async onModuleInit(): Promise<void> {
        this.libraryPath = this.configService.config.ebooks.homeDir;
        const files = await EbookUtils.scanLibForEpubsRecursiveHelper(this.libraryPath);
        files.forEach(file => {
            this.books.push(file);
            this.curId++;
        });
    }

    public async addBookToLibrary(filePath: string): Promise<number> {
        if (Object.values(this.books).includes(this.getFileName(filePath))) {
            throw new Error(`${this.getFileName(filePath)} is already in library`);
        }
        const newFilePath = path.join(this.libraryPath, path.basename(filePath));
        fs.copyFileSync(filePath, newFilePath);
        this.books[this.curId] = newFilePath;
        this.curId++;
        return (this.curId - 1);
    }

    public async removeBookFromLibrary(id: number): Promise<void> {
        const filePath = this.books[id];
        if (!filePath) {
            throw new Error(`No book with id ${id} found in library.`);
        }
        fs.unlinkSync(filePath);
        this.books[id] = '';
    }

    public async getLibraryData(): Promise<CalibreLibraryData[]> {
        const ret: CalibreLibraryData[] = [];
        this.books.forEach((book, index) => {
            if (book) {
                ret.push({
                    id: index,
                    title: book, 
                    authors: '',
                });
            }
        });
        return ret;
    }

    private getFileName(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

}