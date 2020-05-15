import Epub from 'epub';
import fs from 'fs';
import path from 'path';
import { AsyncUtils } from './async-utils';

export class EbookUtils {

    public static async getEpubData(filePaths: string[]): Promise<Epub[]> {
        const ret: Epub[] = [];
        await AsyncUtils.forEachAsync(filePaths, filePath => {
            return new Promise((res, rej) => {
                try {
                    const epub = new Epub(filePath);
                    ret.push(epub);
                    epub.on('end', () => {
                        res();
                    });
                    epub.parse();

                } catch(e) {
                    rej(e); 
                }
            });
        });
        return ret;
    }

    public static async scanLibForEpubsRecursiveHelper(curDir: string): Promise<string[]> {
        const ret: string[] = [];
        const files = fs.readdirSync(curDir);
        await AsyncUtils.forEachAsync(files, async fileName => {
            const filePath = path.join(curDir, fileName);
            let stats = fs.statSync(filePath);
            if(stats.isDirectory()) {
                ret.push(...(await this.scanLibForEpubsRecursiveHelper(filePath)));
            }
            if (path.extname(fileName) === '.epub') {
                ret.push(filePath);
            }
        });
        return ret;
    }

}