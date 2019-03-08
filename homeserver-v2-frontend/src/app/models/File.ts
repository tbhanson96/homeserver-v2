export class File {

    private name: string;
    private permissions: string;
    private date: string;
    private size: number;

    constructor(name: string, permissions: string, date: string, size: number) {
        this.name = name;
        this.permissions = permissions;
        this.date = date;
        this.size = size;
    }
}
