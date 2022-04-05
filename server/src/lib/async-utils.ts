export class AsyncUtils {

    public static async forEachAsync(elements: Array<any>, predicate: (e: any) => Promise<void>): Promise<void> {
        await Promise.all(elements.map(element => {
            return predicate(element);
        }));
    }

    public static async sleepAsync(timeMs: number): Promise<void> {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, timeMs);
        })
    }
}