import { Injectable, OnModuleInit } from '@nestjs/common';
import { File } from '../models/file';
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

    getFiles(directory?: string): File[] {
        let ret: File[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory || ''));
        for (let f of files) {
            let stats = fs.statSync(path.join(this.rootDir, directory || '', f));
            const props = FileUtils.getFileProps(f, stats); 
            ret.push(new File(props));
        }
        return ret;
    }

    getLocalFilePath(filePath: string): string {
        console.log(path.join(this.rootDir, filePath));
        return path.join(this.rootDir, filePath);
    }
}
