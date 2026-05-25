import { Calibre } from 'node-calibre';
import { QueuedCalibreService } from '../../src/ebooks/queued-calibre.service';

describe('QueuedCalibreService', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does not run a second calibre operation until the first one completes', async () => {
        let resolveFirst: (value: string) => void;
        const firstResult = new Promise<string>(resolve => resolveFirst = resolve);
        const run = jest.spyOn(Calibre.prototype, 'run')
            .mockImplementationOnce(() => firstResult)
            .mockResolvedValueOnce('newspapers');
        const service = new QueuedCalibreService();

        const books = service.run('calibredb list', [], { libraryPath: '/library/books' });
        const newspapers = service.run('calibredb list', [], { libraryPath: '/library/newspapers' });
        await Promise.resolve();

        expect(run).toHaveBeenCalledTimes(1);

        resolveFirst!('books');
        await expect(books).resolves.toBe('books');
        await expect(newspapers).resolves.toBe('newspapers');
        expect(run).toHaveBeenCalledTimes(2);
    });
});
