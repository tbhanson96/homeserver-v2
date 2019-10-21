import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import * as fs from 'fs';
import { FileService } from "../services/file.service";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly fileService: FileService) { }

    transform(arg: any, metadata: ArgumentMetadata) {
        try {
            if (metadata.data === 'path' || metadata.data === 'file') {
                let stat = fs.statSync(this.fileService.getLocalFilePath(arg || ''));
                if (metadata.data === 'path' && !stat.isDirectory()) {
                    throw new Error();
                } else if (metadata.data === 'file' && stat.isDirectory()) {
                    throw new Error();
                }
            }
        } catch {
            throw new BadRequestException(`Invalid directory path: ${arg}`);
        }
        return arg;
    }
}