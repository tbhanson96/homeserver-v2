export class EbookData {
    constructor(attr: any) {
        this.name = attr.name;
        this.author = attr.author;
        this.length = attr.length;
        this.coverPath = attr.coverPath;
        this.description = attr.description;
    }

    id: number;
    name: string;
    author: string;
    length: string;
    description: string;
    coverPath: string;
    filePath: string;
}