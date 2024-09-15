import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class DatePipe implements PipeTransform {
    constructor() { }

    transform(arg: any, metadata: ArgumentMetadata) {
        if (metadata.metatype === Date) {
            return new Date(arg);
        } else {
            return arg;
        }
    }
}