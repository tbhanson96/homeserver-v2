import Epub from 'epub';
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
}