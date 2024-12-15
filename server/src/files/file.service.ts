import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { FileData } from '../models/fileData.dto';
import { FileUtils } from '../lib/file-utils';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../config/config.service';
import { archiveFolder } from 'zip-lib';
import 'multer';

@Injectable()
export class FileService implements OnModuleInit {
    private rootDir = '';

    constructor(
        private configService: ConfigService,
        private log: Logger,
        ) { }

    onModuleInit() {
        this.rootDir = this.configService.config.files.homeDir;
    }

    async getFiles(directory: string): Promise<FileData[]> {
        directory = directory || '';
        let ret: FileData[] = [];
        let files = fs.readdirSync(path.join(this.rootDir, directory));
        if (!this.configService.config.files.showHidden) {
            files = FileUtils.removeHiddenFiles(files);
        }
        for (let f of files) {
            let stats = fs.statSync(path.join(this.rootDir, directory, f));
            const props = FileUtils.getFileProps(f, stats); 
            props.link = directory === '' ? f : path.join('/', directory, f);
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
        const msg = files.map(f => f.originalname).join(', ');
        this.log.log(`Successfully uploaded file(s): ${msg}`);
    }

    async downloadFiles(filePath: string): Promise<string> {
        try {
            const tmpPath = this.configService.config.files.uploadDir;
            const sourcePath = path.join(this.rootDir, filePath);
            const outputPath = path.join(tmpPath, `${path.basename(sourcePath)}`);
            await archiveFolder(sourcePath, outputPath);
            this.log.log(`Created zip archive of ${sourcePath}`);
            return outputPath;
        } catch (e: any) {
            throw new Error(`Failed to zip ${filePath}: ${e.message}`);
        }
    }

    async deleteFile(file: FileData) {
        const path = this.getLocalFilePath(file.link);
        fs.unlinkSync(path);
        this.log.log(`Succesfully deleted file ${file.name}`);
    }

    async moveFile(file: FileData, filePath: string) {
        let newPath = '';
        try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                newPath = path.join(filePath, file.name);
            } else {
                const message = `Can't rename file ${file.name}:a file already exists at location: ${filePath}`;
                this.log.error(message);
                throw new BadRequestException(message)
            }
        } catch (e) {
            if (e instanceof BadRequestException) {
                throw e;
            } else {
                newPath = filePath;
            }
        }
        fs.renameSync(this.getLocalFilePath(file.link), newPath);
        this.log.log(`Moved ${file.name} to ${newPath}`);
    }
}
