import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileData } from '../models/fileData';
import { FileUtils } from '../lib/file-utils';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from './config.service';

@Injectable()
export class FileService implements OnModuleInit {
    private rootDir = '';

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.rootDir = this.configService.env.ROOT_DIR;
    }

    getFiles(directory: string, includeHiddenFiles: boolean): FileData[] {
        directory = directory || '';
        let ret: FileData[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory));
        if (!includeHiddenFiles) {
            files = FileUtils.removeHiddenFiles(files);
        }
        for (let f of files) {
            let stats = fs.statSync(path.join(this.rootDir, directory, f));
            const props = FileUtils.getFileProps(f, stats); 
            props.link = path.join(directory, f);
            ret.push(new FileData(props));
        }
        return ret;
    }

    getLocalFilePath(filePath: string): string {
        return path.join(this.rootDir, filePath);
    }

    async copyFiles(files: any, directory: string) {
        for (const i of files) {
            const file = files[i];
            const newPath = path.join(directory, file.originalname);
            await fs.renameSync(file.path, newPath);
        }
        return new Promise((res, rej) => {
            
        })
    }
}
