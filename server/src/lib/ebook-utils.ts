import Epub from 'epub';
import fs from 'fs';
import path from 'path';
import { AsyncUtils } from './async-utils';
import { routes } from '../routes';

export class EbookUtils {

    public static async getEpubData(filePath: string): Promise<Epub> {
        return new Promise<Epub>((res, rej) => {
            try {
                const epub = new Epub(filePath);
                epub.on('end', () => {
                    res(epub);
                });
                epub.parse();

            } catch(e) {
                rej(e); 
            }
        });
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