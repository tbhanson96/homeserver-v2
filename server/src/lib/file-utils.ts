import fs from 'fs';
import path from 'path';
import { AsyncUtils } from './async-utils';

export class FileUtils {

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
            filesize /= 1000;
        } while (filesize > 1);

        filesize *= 1000;
        if (ind !== 0) {
            return filesize.toFixed(2).toString() + ' ' + suffix[ind];
        } else {
            return filesize.toString() + ' ' + suffix[ind];
        }
    }

    public static getFileProps(filename: string, stats: any): any {
        let timestamp = this.parseTimestamp(stats.mtime.toDateString());
        let permissions = this.parsePerms(stats.mode.toString());
        let type = filename.split('.').slice(-1)[0];
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

    public static removeHiddenFiles(files: string[]): string[] {
        return files.filter(file => file[0] != '.');
    }

    public static async removeDir(dir: string): Promise<void> {
        if (fs.existsSync(dir)) {
            const contents = await fs.promises.readdir(dir);
            await AsyncUtils.forEachAsync(contents, async (file) => {
                const curPath = path.join(dir, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    await this.removeDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dir);
        }
    }

    public static changeExt(filePath: string, newExt: string): string {
        const oldExt = path.extname(filePath);
        const pathNoExt = path.join(path.dirname(filePath), path.basename(filePath, oldExt));
        return `${pathNoExt}.${newExt}`;
    }
}