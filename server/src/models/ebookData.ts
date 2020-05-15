import { ApiModelProperty } from "@nestjs/swagger";

export class EbookData {
    constructor(attr: any) {
        this.name = attr.name;
        this.author = attr.author;
        this.length = attr.length;
        this.relativeCoverPath = attr.relativeCoverPath;
        this.description = attr.description;
    }

    @ApiModelProperty()
    id: number;

    @ApiModelProperty()
    name: string;

    @ApiModelProperty()
    author: string;

    @ApiModelProperty()
    length: string;

    @ApiModelProperty()
    description: string;

    @ApiModelProperty()
    relativeCoverPath: string;
}