import Epub from 'epub';
import { AsyncUtils } from './async-utils';

export class EbookUtils {

    public static parseName(filename: string): string {
        let arr = filename.split('.');
        arr.splice(-1);
        return arr.join('.');
    }

    public static getFileExt(filename: string): string {
        return filename.split('.').slice(-1)[0];
    }
    
    public static async getEpubData(filePaths: string[]): Promise<Epub[]> {
        const ret: Epub[] = [];
        await AsyncUtils.forEachAsync(filePaths, filePath => {
            return new Promise(res => {
                const epub = new Epub(filePath);
                ret.push(epub);
                epub.on('end', () => {
                    res();
                });
                epub.parse();
            });
        });
        return ret;
    }
}