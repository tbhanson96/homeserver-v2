
export class FileData {
    constructor(attr: any) {
        this.name = attr.name;
        this.type = attr.type;
        this.timestamp = attr.timestamp;
        this.size = attr.size;
        this.permissions = attr.permissions;
        this.link = attr.link;
    }
    name: string;

    type: string;

    timestamp: string;

    size: string;

    permissions: string;

    link: string;
}