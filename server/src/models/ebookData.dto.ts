
export class EbookData {
    constructor(attr: any) {
        this.name = attr.name;
        this.author = attr.author;
        this.length = attr.length;
        this.relativeCoverPath = attr.relativeCoverPath;
        this.description = attr.description;
    }

    name: string;

    author: string;

    length: string;

    description: string;

    relativeCoverPath: string;
}