import { Logger } from '@nestjs/common';
import { CalibreService } from '../../src/ebooks/calibre.service';
import { EbookService } from '../../src/ebooks/ebook.service';
import { ConfigService } from '../../src/config/config.service';

describe('EbookService', () => {
    it('sends Kindle documents with a body so the attachment is a multipart MIME part', async () => {
        const configService = {
            config: {
                ebooks: {
                    kindeEmail: 'reader@kindle.com',
                },
                email: {
                    sender: 'sender@gmail.com',
                },
            },
        } as ConfigService;
        const service = new EbookService(configService, {} as CalibreService, new Logger());
        const sendMail = jest.fn((_options, callback) => callback(null, {}));
        (service as any).mailer = { sendMail };

        await service.sendToKindle(['/library/My Book.epub']);

        expect(sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: '<sender@gmail.com>',
                to: 'reader@kindle.com',
                subject: 'My Book.epub',
                text: 'Document attached for Send to Kindle.',
                attachments: [{
                    filename: 'My Book.epub',
                    path: '/library/My Book.epub',
                }],
            }),
            expect.any(Function),
        );
    });
});
