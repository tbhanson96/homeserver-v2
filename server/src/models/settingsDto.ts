import { ApiModelProperty } from "@nestjs/swagger";

export class SettingsDto {
    @ApiModelProperty()
    showHiddenFiles: boolean;
};