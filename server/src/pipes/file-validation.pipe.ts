import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import * as fs from 'fs';
import { FileService } from "../services/file.service";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly fileService: FileService) { }

    transform(value: any, metadata: ArgumentMetadata) {
        try {
            console.log(this.fileService.getLocalFilePath(value || ''))
            let stat = fs.statSync(this.fileService.getLocalFilePath(value || ''));
            if (!stat.isDirectory) {
                throw new Error();
            }
        } catch {
            throw new BadRequestException(`Invalid directory path: ${value}`);
        }
        return value;
    }
}