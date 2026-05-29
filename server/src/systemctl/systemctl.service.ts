import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { execFile } from 'child_process';
import { SystemctlActionResultDto, SystemctlUnitDto } from '../models/systemctl.dto';

type SystemctlUnitAction = 'start' | 'stop' | 'restart';

@Injectable()
export class SystemctlService {

    private readonly unitPattern = /^[A-Za-z0-9_.@:-]+\.service$/;

    async listUnits(): Promise<SystemctlUnitDto[]> {
        const stdout = await this.runSystemctl([
            '--user',
            'list-units',
            '--type=service',
            '--all',
            '--no-legend',
            '--no-pager',
            '--plain',
        ]);

        return stdout
            .split('\n')
            .map(line => line.trim())
            .filter(line => !!line)
            .map(line => this.parseUnitLine(line));
    }

    async startUnit(unit: string): Promise<SystemctlActionResultDto> {
        return await this.runUnitAction(unit, 'start');
    }

    async stopUnit(unit: string): Promise<SystemctlActionResultDto> {
        return await this.runUnitAction(unit, 'stop');
    }

    async restartUnit(unit: string): Promise<SystemctlActionResultDto> {
        return await this.runUnitAction(unit, 'restart');
    }

    private async runUnitAction(unit: string, action: SystemctlUnitAction): Promise<SystemctlActionResultDto> {
        this.validateUnit(unit);
        await this.runSystemctl(['--user', action, unit]);
        return {
            unit,
            action,
        };
    }

    private parseUnitLine(line: string): SystemctlUnitDto {
        const parts = line.split(/\s+/);
        return {
            name: parts[0],
            load: parts[1],
            active: parts[2],
            sub: parts[3],
            description: parts.slice(4).join(' '),
        };
    }

    private validateUnit(unit: string) {
        if (!this.unitPattern.test(unit)) {
            throw new BadRequestException('Invalid systemd user service unit name.');
        }
    }

    private runSystemctl(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            execFile('systemctl', args, (error, stdout, stderr) => {
                if (error) {
                    reject(new InternalServerErrorException(stderr || error.message));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
