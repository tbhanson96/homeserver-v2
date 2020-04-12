import { EbookData } from "../models/ebookData";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EbookService {

    public async getEbooks(): Promise<EbookData[]> { return []; };

    public async addBooks(files: Express.Multer.File[]): Promise<string[]>{ return []; };

    public async sendToKindle(filePaths: string[]): Promise<void> { };

}