export class File {
    constructor(attr: any) {
        this.name = attr.name;
        this.type = attr.type;
        this.timestamp = attr.timestamp;
        this.size = attr.size;
        this.permissions = attr.permissions;
    }
    name: string;
    type: string;
    timestamp: string;
    size: string;
    permissions: string;
}