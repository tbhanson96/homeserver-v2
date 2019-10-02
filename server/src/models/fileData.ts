import { ApiModelProperty } from "@nestjs/swagger";

export class FileData {
    constructor(attr: any) {
        this.name = attr.name;
        this.type = attr.type;
        this.timestamp = attr.timestamp;
        this.size = attr.size;
        this.permissions = attr.permissions;
    }
    @ApiModelProperty()
    name: string;

    @ApiModelProperty()
    type: string;

    @ApiModelProperty()
    timestamp: string;

    @ApiModelProperty()
    size: string;

    @ApiModelProperty()
    permissions: string;
}