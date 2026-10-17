import { Logger } from '@nestjs/common';
import { Calibre } from 'node-calibre';
import { RealCalibreService } from '../../src/ebooks/real-calibre.service';

describe('RealCalibreService', () => {
    const libraryPath = '/library';

    function createService(output: string) {
        const calibre = {
            run: jest.fn().mockResolvedValue(output),
        } as unknown as Calibre;
        const logger = {
            warn: jest.fn(),
        } as unknown as Logger;
        return {
            logger,
            service: new RealCalibreService(calibre, libraryPath, logger),
        };
    }

    it('parses normal calibredb machine output', async () => {
        const { logger, service } = createService('[{"id":1,"title":"A book","formats":[],"cover":null}]\n');

        await expect(service.getLibraryData()).resolves.toEqual([
            expect.objectContaining({ id: 1, title: 'A book', cover: '' }),
        ]);
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it('uses a complete JSON array when calibredb appends diagnostic output', async () => {
        const { logger, service } = createService('[{"id":1,"title":"A ] book","formats":[],"cover":null}]\ncalibredb diagnostic');

        await expect(service.getLibraryData()).resolves.toEqual([
            expect.objectContaining({ id: 1, title: 'A ] book', cover: '' }),
        ]);
        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringMatching(/^Ignored \d+ trailing character/),
        );
    });

    it('rejects incomplete JSON rather than returning partial library data', async () => {
        const { service } = createService('[{"id":1,"title":"A book"}');

        await expect(service.getLibraryData()).rejects.toThrow(SyntaxError);
    });
});
