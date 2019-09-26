import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import * as fs from 'fs';
import { FileService } from "../services/file.service";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly fileService: FileService) { }

    transform(filePath: string, metadata: ArgumentMetadata) {
        try {
            let stat = fs.statSync(this.fileService.getLocalFilePath(filePath || ''));
            if (metadata.data === 'path' && !stat.isDirectory) {
                throw new Error();
            } else if (metadata.data === 'file' && stat.isDirectory) {
                throw new Error();
            }
        } catch {
            throw new BadRequestException(`Invalid directory path: ${filePath}`);
        }
        return filePath;
    }
}