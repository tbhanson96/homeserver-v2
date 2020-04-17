export class AsyncUtils {

    public static async forEachAsync(elements: Array<any>, predicate: (e: any) => Promise<void>): Promise<void> {
        await Promise.all(elements.map(element => {
            return predicate(element);
        }));
    }
}