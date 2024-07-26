import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { EbookData } from "../models/ebookData.dto";
import { routes } from "../routes";
import { AsyncUtils } from '../lib/async-utils';
import Mail from "nodemailer/lib/mailer";
import { CalibreService } from "./calibre.service";
import { FileUtils } from "../lib/file-utils";

export interface UploadFile {
    originalname: string;
    path: string;
}

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
        this.ebookDir = this.configService.config.ebooks.homeDir;
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

    public async getEbooks(): Promise<EbookData[]> {
        const library = await this.calibre.getLibraryData();
        const ret: EbookData[] = [];
        library.forEach((epub) => {
            const epubFormat = epub.formats.find(f => path.extname(f) === 'epub') || epub.formats[0];
            ret.push({
                id: epub.id,
                length: epub.size,
                name: epub.title,
                author: epub.authors,
                description: epub.comments,
                coverPath: epub.cover,
                filePath: path.join(routes.ebooks, path.relative(this.ebookDir, epubFormat)),
            });
        });
        return ret;
    }

    public getLocalFilePath(ebook: EbookData) {
        const relativePath = path.relative(routes.ebooks, ebook.filePath);
        return path.resolve(this.ebookDir, relativePath);
    }

    public async addBooks(files: UploadFile[]): Promise<string[]> {
        const ret: string[] = [];
        await AsyncUtils.forEachAsync(files, async f => {
            const newPath = path.join(path.dirname(f.path), f.originalname);
            fs.renameSync(f.path, newPath);
            const id = await this.calibre.addBookToLibrary(newPath);
            this.log.log(`Successfully added ${newPath} to ebook library`);
        });
        return ret;
    }

    public async sendToKindle(filePaths: string[]): Promise<void> {
        if (!this.mailer) {
            this.log.log(`Skipping email of books: ${filePaths.join(', ')}, mailing is not enabled`);
            return;
        }
        const promises: Promise<void>[] = [];
        filePaths.forEach(file => {
            let options = {
                from: `<${this.configService.config.email.sender}>`,
                to: this.configService.config.ebooks.kindeEmail,
                attachments: [
                    {
                        path: file,
                    }
                ]
            }
            promises.push(new Promise((res, rej) => {
                this.mailer.sendMail(options, (err, info) => {
                    if (err) {
                        rej(err);
                    } else {
                        this.log.log(`Succesfully sent book to kindle: ${path.basename(file)}`);
                        res();
                    }
                });
            }));
        });
        await Promise.all(promises);
    }

    public async removeBookFromLibrary(book: EbookData): Promise<void> {
        await this.calibre.removeBookFromLibrary(book.id);
    }
}