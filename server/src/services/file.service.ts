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

    getFiles(directory?: string): FileData[] {
        directory = directory || '';
        let ret: FileData[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory));
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
}
