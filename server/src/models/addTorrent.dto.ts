import { ApiProperty } from '@nestjs/swagger';
import { TorrentCategory } from '../torrents/torrents.service';

export class AddTorrentDto {
    @ApiProperty({ description: 'Magnet link to add to Transmission.' })
    magnet: string;

    @ApiProperty({
        enum: TorrentCategory,
        enumName: 'TorrentCategory',
        description: 'Target library category to map to a Transmission download directory.',
    })
    category: TorrentCategory;
}

export class AddTorrentResultDto {
    @ApiProperty({ required: false })
    id?: number;

    @ApiProperty({ required: false })
    name?: string;

    @ApiProperty({ required: false })
    hashString?: string;

    @ApiProperty({ description: 'Final Transmission download directory used for the torrent.' })
    downloadDir: string;

    @ApiProperty({ description: 'Whether Transmission reported the torrent as an existing duplicate.' })
    duplicate: boolean;
}
