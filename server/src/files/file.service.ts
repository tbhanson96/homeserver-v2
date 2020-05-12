import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { FileData } from '../models/fileData';
import { FileUtils } from '../lib/file-utils';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../services/config.service';

@Injectable()
export class FileService implements OnModuleInit {
    private rootDir = '';

    constructor(
        private configService: ConfigService,
        private log: Logger,
        ) { }

    onModuleInit() {
        this.rootDir = this.configService.env.FILES_DIR;
    }

    async getFiles(directory: string, includeHiddenFiles: boolean): Promise<FileData[]> {
        directory = directory || '';
        let ret: FileData[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory));
        if (!includeHiddenFiles) {
            files = FileUtils.removeHiddenFiles(files);
        }
        for (let f of files) {
            let stats = fs.statSync(path.join(this.rootDir, directory, f));
            const props = FileUtils.getFileProps(f, stats); 
            props.link = directory === '' ? f : path.join(directory, f);
            ret.push(new FileData(props));
        }
        return ret;
    }

    getLocalFilePath(filePath: string): string {
        return path.join(this.rootDir, filePath);
    }

    async copyFiles(files: Express.Multer.File[], directory: string) {
        for (const file of files) {
            const newPath = path.join(this.rootDir, directory, file.originalname);
            fs.copyFileSync(file.path, newPath);
            fs.unlinkSync(file.path);
        }
    }

    async deleteFile(file: FileData) {
        const path = this.getLocalFilePath(file.link);
        fs.unlinkSync(path);
        this.log.log(`Succesfully deleted file ${file.name}`);
    }
}
