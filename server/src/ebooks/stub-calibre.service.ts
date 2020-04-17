import path from 'path';
import fs from 'fs';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CalibreService } from './calibre.service';
import { ConfigService } from '../services/config.service';

@Injectable()
export class StubCalibreService implements CalibreService, OnModuleInit {

    private libraryPath: string;

    private books: any = {};
    private curId = 0;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
    ) { }

    onModuleInit() {
        this.libraryPath = this.configService.env.EBOOK_DIR;
    }

    public async addBookToLibrary(filePath: string): Promise<number> {
        if (Object.values(this.books).includes(this.getFileName(filePath))) {
            throw new Error(`${this.getFileName(filePath)} is already in library`);
        }
        fs.copyFileSync(filePath, path.join(this.libraryPath, path.basename(filePath)));
        this.books[this.curId] = this.getFileName(filePath);
        this.curId++;
        return (this.curId - 1);
    }

    public async addBookFormatToLibrary(id: number, filePath: string): Promise<void> {
        if (!this.books[id]) {
            throw new Error(`${this.getFileName(filePath)} does not exist in library`);
        }
        fs.copyFileSync(filePath, path.join(this.libraryPath, path.basename(filePath)));
    }

    public async convertToMobi(filepath: string): Promise<string> {
        const newFilePath = path.join(path.dirname(filepath), this.getFileName(filepath) + '.mobi');
        fs.copyFileSync(filepath, newFilePath);
        return newFilePath;
    }

    private getFileName(filePath: string): string {
        return path.basename(filePath, path.extname(filePath));
    }

}