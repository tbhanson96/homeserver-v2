import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { EbookUtils } from '../lib/ebook-utils';
import { EbookData } from "../models/ebookData.dto";
import { routes } from "../routes";
import { AsyncUtils } from '../lib/async-utils';
import Mail from "nodemailer/lib/mailer";
import { CalibreService } from "./calibre.service";

@Injectable()
export class EbookService implements OnModuleInit {

    private ebookDir: string;
    private mailer: Mail;

    constructor(
        private readonly configService: ConfigService,
        private readonly calibre: CalibreService,
        private readonly log: Logger,
        ) { }

    onModuleInit() {
        this.ebookDir = this.configService.env.EBOOK_DIR;
        if (this.configService.env.USE_EMAIL_CLIENT === 'true') {
            this.mailer = nodemailer.createTransport({
                host: this.configService.env.EMAIL_HOST,
                port: this.configService.env.EMAIL_PORT,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: this.configService.env.EMAIL_ADDRESS,
                    clientId: this.configService.env.EMAIL_CLIENT_OAUTH_ID,
                    clientSecret: this.configService.env.EMAIL_CLIENT_OAUTH_SECRET,
                    refreshToken: this.configService.env.EMAIL_CLIENT_OAUTH_REFRESH_TOKEN,
                },
            });
        } 
    }

    public async getEbooks(): Promise<EbookData[]> {
        const filePaths = await EbookUtils.scanLibForEpubsRecursiveHelper(this.ebookDir);
        const epubs = await EbookUtils.getEpubData(filePaths);
        const library = await this.calibre.getLibraryData();
        const ret: EbookData[] = [];
        epubs.forEach((epub, index) => {
            const id = library.find(entry =>
                entry.title === epub.metadata.title
            )?.id ??
            library.find(entry => 
                filePaths[index] === entry.title
            )?.id ?? -1;
            ret.push({
                id: id,
                length: '',
                name: epub.metadata.title,
                author: epub.metadata.creator,
                description: epub.metadata.description,
                relativeCoverPath: fs.existsSync(path.join(path.dirname(filePaths[index]), 'cover.jpg'))
                    ? `${routes.ebooks}/${path.relative(this.ebookDir, path.join(path.dirname(filePaths[index]), 'cover.jpg'))}`
                    : '',
            });
        });
        return ret;
    }

    public async addBooks(files: any[]): Promise<string[]> {
        const ret: string[] = [];
        await AsyncUtils.forEachAsync(files, async f => {
            const newPath = path.join(path.dirname(f.path), f.originalname);
            fs.renameSync(f.path, newPath);
            const id = await this.calibre.addBookToLibrary(newPath);
            this.log.log(`Successfully added ${newPath} to ebook library`);

            if (path.extname(newPath) !== '.mobi') {
                const mobiFilePath = await this.calibre.convertToMobi(newPath);
                ret.push(mobiFilePath);
                await this.calibre.addBookFormatToLibrary(id, mobiFilePath);
            }
        });
        return ret;
    }

    public async sendToKindle(filePaths: string[]): Promise<void> {
        if (!this.mailer) {
            this.log.log(`Skipping email of books: ${filePaths.join(', ')}, mailing is not enabled`);
            return;
        }
        filePaths.forEach(file => {
            let options = {
                from: `<${this.configService.env.EMAIL_ADDRESS}>`,
                to: this.configService.env.KINDLE_EMAIL_ADDRESS,
                attachments: [
                    {
                        path: file,
                    }
                ]
            }
            return new Promise<void>((res, rej) => {
                this.mailer.sendMail(options, (err, info) => {
                    if (err) {
                        rej(err);
                    } else {
                        res();
                    }
                });
            });
        });
    }

    public async removeBookFromLibrary(book: EbookData): Promise<void> {
        await this.calibre.removeBookFromLibrary(book.id);
    }
}