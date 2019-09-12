import { Injectable, OnModuleInit } from '@nestjs/common';
import { File } from '../models/file';
import { FileUtils } from '../lib/file-utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService implements OnModuleInit {

    private rootDir = '';

    onModuleInit() {
        // TODO: refactor to use config service
        this.rootDir = "/home/tim/Documents"
    }

    getFiles(directory: string): File[] {
        let ret: File[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory));
        for (let f of files) {
            let stats = fs.statSync(path.join(this.rootDir, directory, f));
            const props = FileUtils.getFileProps(f, stats); 
            ret.push(new File(props));
        }
        return ret;
    }

    getLocalFilePath(filePath: string): string {
        return path.join(this.rootDir, filePath);
    }
}
