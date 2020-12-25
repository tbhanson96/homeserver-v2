import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException, NotFoundException } from "@nestjs/common";
import * as fs from 'fs';
import { pathToFilename } from "memfs/lib/volume";
import { FileService } from "./file.service";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly fileService: FileService) { }

    transform(arg: any, metadata: ArgumentMetadata) {
        try {
            if (metadata.data === 'path' || metadata.data === 'file') {
                arg = decodeURI(arg);
                let stat = fs.statSync(this.fileService.getLocalFilePath(arg || ''));
                if (metadata.data === 'path' && !stat.isDirectory()) {
                    throw new Error();
                } else if (metadata.data === 'file' && stat.isDirectory()) {
                    throw new Error();
                }
            }
        } catch {
            throw new NotFoundException(`Invalid directory path: ${arg}`);
        }
        if (metadata.data === 'name') {
            const name = decodeURI(arg);
            if (name.includes('/') || name.includes('\\')) {
                throw new BadRequestException(`Name is not valid: ${arg}`);
            }
        }
        return arg;
    }
}