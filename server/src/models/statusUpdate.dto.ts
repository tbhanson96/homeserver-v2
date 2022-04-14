import { ApiProperty } from "@nestjs/swagger";

export enum StatusType {
    NotRunning,
    InProgress,
    Failed,
    Done,
}
export enum StatusChannel {
    EbookDownload = 'EbookDownload',
    EbookUpload = 'EbookUpload',
    FileUpload = 'FileUpload',
}
export class StatusUpdate {
    progress: number;
    text?: string;

    @ApiProperty({ enum: StatusType, enumName: 'StatusType'})
    status: StatusType;

    @ApiProperty({ enum: StatusChannel, enumName: 'StatusChannel'})
    channel: StatusChannel;
}