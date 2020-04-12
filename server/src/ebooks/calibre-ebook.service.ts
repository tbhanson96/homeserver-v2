import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "../services/config.service";
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { Calibre } from 'node-calibre';
import { EbookUtils } from '../lib/ebook-utils';
import { EbookData } from "../models/ebookData";
import { EbookService } from "./ebook.service";
import { routes } from "../routes";
import { AsyncUtils } from '../lib/async-utils';

@Injectable()
export class CalibreEbookService implements OnModuleInit, EbookService {

    private ebookDir: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly log: Logger,
        ) { }

    onModuleInit() {
        this.ebookDir = this.configService.env.EBOOK_DIR;
    }

    public async getEbooks(): Promise<EbookData[]> {
        const filePaths = await this.scanLibForEpubsRecursiveHelper(this.ebookDir);
        const epubs = await EbookUtils.getEpubData(filePaths);
        const ret: EbookData[] = [];
        epubs.forEach((epub, index) => {
            ret.push(new EbookData({
                name: epub.metadata.title,
                author: epub.metadata.creator,
                description: epub.metadata.description,
                relativeCoverPath: fs.existsSync(path.join(path.dirname(filePaths[index]), 'cover.jpg'))
                    ? `${routes.ebooks}/${path.relative(this.ebookDir, path.join(path.dirname(filePaths[index]), 'cover.jpg'))}`
                    : null,
            }));
        });
        return ret;
    }

    private async scanLibForEpubsRecursiveHelper(curDir: string): Promise<string[]> {
        const ret: string[] = [];
        const files = fs.readdirSync(curDir);
        await AsyncUtils.forEachAsync(files, async fileName => {
            const filePath = path.join(curDir, fileName);
            let stats = fs.statSync(filePath);
            if(stats.isDirectory()) {
                ret.push(...(await this.scanLibForEpubsRecursiveHelper(filePath)));
            }
            if (EbookUtils.getFileExt(fileName) === 'epub') {
                ret.push(filePath);
            }
        });
        return ret;
    }

    public async addBooks(files: any[]): Promise<string[]> {
        const ret: string[] = [];
        const calibre = new Calibre({ library: this.ebookDir });
        await AsyncUtils.forEachAsync(files, async f => {
            const newPath = path.join(path.dirname(f.path), f.originalname);
            fs.renameSync(f.path, newPath);
            const id = this.getCalibreIdFromAddResult(await calibre.run('calibredb add', [newPath]));
            this.log.log(`Successfully added ${newPath} to ebook library`);

            if (EbookUtils.getFileExt(newPath) !== 'mobi') {
                const mobiFilePath = await this.convertToMobi(newPath);
                ret.push(mobiFilePath);
                await calibre.run('calibredb add_format', [id, mobiFilePath])
            }
        });
        return ret;
    }

    public async sendToKindle(filePaths: string[]): Promise<void> {
        filePaths.forEach(file => {
            let mailer = nodemailer.createTransport({
                host: this.configService.env.EMAIL_HOST,
                port: this.configService.env.EMAIL_PORT,
                secure: true,
                auth: {
                    user: this.configService.env.EMAIL_ADDRESS,
                    pass: this.configService.env.EMAIL_PASSWORD,
                }
            });
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
                mailer.sendMail(options, (err, info) => {
                    if (err) {
                        rej();
                    } else {
                        res();
                    }
                });
            });
        });
    }

    private async convertToMobi(filepath: string): Promise<string> {
        const calibre = new Calibre({ library: this.ebookDir });
        const mobiFilePath = await calibre.ebookConvert(filepath, 'mobi');
        this.log.log(`Succesfully converted ${filepath} to ${mobiFilePath}`);
        return mobiFilePath;
    }

    private getCalibreIdFromAddResult(result: string): number {
        return parseInt(result.slice(result.indexOf(': ') + 1, result.length));
    }
}