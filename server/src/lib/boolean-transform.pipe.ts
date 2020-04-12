import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class BooleanPipe implements PipeTransform {
    constructor() { }

    transform(arg: any, metadata: ArgumentMetadata) {
        if (metadata.metatype === Boolean) {
            return arg === 'true';
        } else {
            return arg;
        }
    }
}