import { ApiProperty } from '@nestjs/swagger';

export class SystemctlUnitDto {
    @ApiProperty({ description: 'Systemd unit name.' })
    name: string;

    @ApiProperty({ description: 'Whether systemd loaded the unit successfully.' })
    load: string;

    @ApiProperty({ description: 'High-level active state for the unit.' })
    active: string;

    @ApiProperty({ description: 'Low-level active state for the unit.' })
    sub: string;

    @ApiProperty({ description: 'Human-readable unit description.' })
    description: string;
}

export class RestartSystemctlUnitDto {
    @ApiProperty({ description: 'User service unit to restart, for example homeserver.service.' })
    unit: string;
}

export class SystemctlActionResultDto {
    @ApiProperty({ description: 'Unit affected by the action.' })
    unit: string;

    @ApiProperty({ description: 'Action that was performed.' })
    action: string;
}
