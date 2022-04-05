import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {
    transform(value: number): string {
        let count = 0;
        const units = ['B', 'kB', 'mB', 'gB'];
        while (value / 1024 > 1) {
            value /= 1024;
            count++;
        }
        return value.toFixed(3) + ' ' + units[count];
    }
}