import * as validFileTypes from '../config/valid-file-types.json';
import * as path from 'path';

export class FileUtils {
    public static parseFileName(filePath: string): string {
        return filePath.split(path.sep)[-1]
    }

    public static parsePerms(perms: number): string {
        let permsBuffer = [];
        const modes = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
        let octal = perms & 777;
        do {
            let dig = octal % 8;
            permsBuffer.unshift(modes[dig])
            octal = (octal - (octal % 8)) / 8; //shift decimal over one in octal
        } while (octal > 0);
        let ret = '';
        for (let str of permsBuffer) {
            ret += str;
        }
        return ret;
    }

    public static parseTimestamp(stamp: string): string {
        let temp = stamp.split('.')[0].split('T');
        if (temp.length > 1) {
            return 'T' + temp[1];
        }
        else return temp[0];
    }

    public static splitDir(path: string): string[] {
        let temp = path.split('/');
        let ret = []
        for (let piece of temp) {
            if (piece !== '') {
                ret.push(piece);
            }
        }

        return ret
    }

    public static parseSize(filesize: number): string {
        const suffix = ['bytes', 'kB', 'mB', 'gB'];
        let ind = -1; //initialize to -1 to correct index, consequence of do-while loop
        do {
            ind++;
            filesize /= 1024;
        } while (filesize > 1);

        filesize *= 1024;
        if (ind !== 0) {
            return filesize.toFixed(2).toString() + ' ' + suffix[ind];
        } else {
            return filesize.toString() + ' ' + suffix[ind];
        }
    }

    public static getFileProps(filename: string, stats: any): any {
        let timestamp = this.parseTimestamp(stats.mtime.toDateString());
        let permissions = this.parsePerms(stats.mode.toString());
        let extension = filename.split('.').slice(-1)[0];
        let type = validFileTypes.find(t => t === extension);
        if(!type) {
            type = 'file';
        }
        if (stats.isDirectory()) {
            type = 'dir';
        }
        let size = this.parseSize(stats.size);
        let name = stats.isDirectory() ? filename+'/' : filename;
        return { name, type, size, timestamp, permissions };
    }
}