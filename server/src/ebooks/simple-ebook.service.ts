import { EbookService } from "./ebook.service";
import { ConfigService } from "../services/config.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { EbookData } from "../models/ebookData";
import { EbookUtils } from '../lib/ebook-utils';
import nodemailer from 'nodemailer';
import fs from 'fs';
import https from 'https';
import path from 'path';

@Injectable()
export class SimpleEbookService implements EbookService, OnModuleInit {

    private ebookDir: string;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        this.ebookDir = this.configService.env.EBOOK_DIR;
    }

    public async getEbooks(): Promise<EbookData[]> {
        const filePaths = fs.readdirSync(this.ebookDir)
            .map(f => path.join(this.ebookDir, f))
            .filter(f => EbookUtils.getFileExt(f) === 'epub');
        const ret: EbookData[] = [];
        const epubs = await EbookUtils.getEpubData(filePaths);
        epubs.forEach(epub => {
            ret.push(new EbookData({
                name: epub.metadata.title,
                author: epub.metadata.creator,
                description: epub.metadata.description,
                relativeCoverPath: '/ebooks/cover.jpg',
            }));
        });
        return ret;
    }

    public async addBooks(files: any[]): Promise<string[]> {
        const ret: string[] = [];
        for (const file of files) {
            const newPath = path.join(this.ebookDir, file.originalname);
            fs.copyFileSync(file.path, newPath);
            fs.unlinkSync(file.path);
            ret.push(newPath);
        }
        return ret;
    }

    public async sendToKindle(filePaths: string[]): Promise<void> {
        filePaths.forEach(file => {
            let mailer = nodemailer.createTransport({
                host: this.configService.env.EMAIL_HOST,
                port: this.configService.env.EMAIL_PORT,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: this.configService.env.EMAIL_ADDRESS,
                },
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
}