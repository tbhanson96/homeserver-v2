import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileData } from '../models/fileData';
import { FileUtils } from '../lib/file-utils';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config.service';

@Injectable()
export class FileService implements OnModuleInit {
    private rootDir = '';

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.rootDir = this.configService.env.ROOT_DIR;
    }

    async getFiles(directory: string, includeHiddenFiles: boolean): Promise<FileData[]> {
        directory = directory || '';
        let ret: FileData[] = [];
        let files = await fs.readdirSync(path.join(this.rootDir, directory));
        if (!includeHiddenFiles) {
            files = FileUtils.removeHiddenFiles(files);
        }
        for (let f of files) {
            let stats = await fs.statSync(path.join(this.rootDir, directory, f));
            const props = FileUtils.getFileProps(f, stats); 
            props.link = directory === '' ? f : path.join(directory, f);
            ret.push(new FileData(props));
        }
        return ret;
    }

    getLocalFilePath(filePath: string): string {
        return path.join(this.rootDir, filePath);
    }

    async copyFiles(files: any, directory: string) {
        for (const file of files) {
            const newPath = path.join(this.rootDir, directory, file.originalname);
            await fs.copyFileSync(file.path, newPath);
            await fs.unlinkSync(file.path);
        }
    }

    async deleteFile(file: FileData) {
        const path = this.getLocalFilePath(file.link);
        await fs.unlinkSync(path);
    }
}
