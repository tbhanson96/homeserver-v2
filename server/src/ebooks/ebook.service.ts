import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { EbookData, EbookLibrary } from "../models/ebookData.dto";
import { routes } from "../routes";
import { AsyncUtils } from '../lib/async-utils';
import Mail from "nodemailer/lib/mailer";
import { CalibreService, NewspaperCalibreService } from "./calibre.service";
import { FileUtils } from "../lib/file-utils";

export interface UploadFile {
    originalname: string;
    path: string;
}

@Injectable()
export class EbookService implements OnModuleInit {

    private mailer: Mail;

    constructor(
        private readonly configService: ConfigService,
        private readonly calibre: CalibreService,
        private readonly newspaperCalibre: NewspaperCalibreService,
        private readonly log: Logger,
        ) { }

    onModuleInit() {
        if (this.configService.config.ebooks.useEmailClient) {
            this.mailer = nodemailer.createTransport({
                host: this.configService.config.email.smtpHost,
                port: this.configService.config.email.smtpPort,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: this.configService.config.email.sender,
                    clientId: this.configService.config.email.oauth.id,
                    clientSecret: this.configService.config.email.oauth.secret,
                    refreshToken: this.configService.config.email.oauth.refreshToken,
                },
            });
        } 
    }

    public async getEbooks(libraryType: EbookLibrary = EbookLibrary.Books): Promise<EbookData[]> {
        const library = await this.getCalibre(libraryType).getLibraryData();
        const libraryDir = this.getLibraryDir(libraryType);
        const libraryRoute = this.getLibraryRoute(libraryType);
        const ret: EbookData[] = [];
        library.forEach((epub) => {
            const epubFormat = epub.formats.find(f => path.extname(f) === '.epub') || epub.formats[0];
            ret.push({
                id: epub.id,
                length: epub.size,
                name: epub.title,
                author: epub.authors,
                description: epub.comments,
                coverPath: epub.cover,
                filePath: path.join(libraryRoute, path.relative(libraryDir, epubFormat)),
                library: libraryType,
            });
        });
        return ret;
    }

    public getLocalFilePath(ebook: EbookData, libraryType: EbookLibrary = ebook.library || EbookLibrary.Books) {
        const relativePath = path.relative(this.getLibraryRoute(libraryType), ebook.filePath);
        return path.resolve(this.getLibraryDir(libraryType), relativePath);
    }

    public async addBooks(files: UploadFile[], libraryType: EbookLibrary = EbookLibrary.Books): Promise<string[]> {
        const ret: string[] = [];
        await AsyncUtils.forEachAsync(files, async f => {
            const newPath = path.join(path.dirname(f.path), f.originalname);
            fs.renameSync(f.path, newPath);
            await this.getCalibre(libraryType).addBookToLibrary(newPath);
            this.log.log(`Successfully added ${newPath} to ${libraryType} library`);
            ret.push(newPath);
        });
        return ret;
    }

    public async sendToKindle(filePaths: string[], sendToTori = false): Promise<void> {
        if (!this.mailer) {
            this.log.log(`Skipping email of books: ${filePaths.join(', ')}, mailing is not enabled`);
            return;
        }
        const destination = sendToTori
            ? this.configService.config.ebooks.toriKindleEmail
            : this.configService.config.ebooks.kindeEmail;
        const promises: Promise<void>[] = [];
        filePaths.forEach(file => {
            let options = {
                from: `<${this.configService.config.email.sender}>`,
                to: destination,
                subject: path.basename(file),
                // Kindle does not reliably detect an attachment-only, single-part MIME message.
                text: 'Document attached for Send to Kindle.',
                attachments: [
                    {
                        filename: path.basename(file),
                        path: file,
                    }
                ]
            }
            promises.push(new Promise((res, rej) => {
                this.mailer.sendMail(options, (err, info) => {
                    if (err) {
                        rej(err);
                    } else {
                        this.log.log(`Succesfully sent book to kindle destination ${destination}: ${path.basename(file)}`);
                        res();
                    }
                });
            }));
        });
        await Promise.all(promises);
    }

    public async removeBookFromLibrary(book: EbookData, libraryType: EbookLibrary = book.library || EbookLibrary.Books): Promise<void> {
        await this.getCalibre(libraryType).removeBookFromLibrary(book.id);
    }

    private getCalibre(libraryType: EbookLibrary): CalibreService {
        return libraryType === EbookLibrary.Newspapers ? this.newspaperCalibre : this.calibre;
    }

    private getLibraryDir(libraryType: EbookLibrary): string {
        return libraryType === EbookLibrary.Newspapers
            ? this.configService.config.newspapers.homeDir
            : this.configService.config.ebooks.homeDir;
    }

    private getLibraryRoute(libraryType: EbookLibrary): string {
        return libraryType === EbookLibrary.Newspapers ? routes.newspapers : routes.ebooks;
    }
}
