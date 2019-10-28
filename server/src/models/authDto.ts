import { ApiModelProperty } from "@nestjs/swagger";

export class AuthDto {
    @ApiModelProperty()
    username: string;

    @ApiModelProperty()
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

}