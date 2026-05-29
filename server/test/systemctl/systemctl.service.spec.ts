import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { execFile } from 'child_process';
import { SystemctlService } from '../../src/systemctl/systemctl.service';

jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

const mockedExecFile = execFile as unknown as jest.Mock;

describe('SystemctlService', () => {
  let service: SystemctlService;

  beforeEach(() => {
    service = new SystemctlService();
    mockedExecFile.mockReset();
  });

  it('lists user service units', async () => {
    mockedExecFile.mockImplementation((_command, _args, callback) => callback(null, [
      'homeserver.service loaded active running Homeserver app',
      'backup.timer.service loaded inactive dead Backup worker',
    ].join('\n'), ''));

    const units = await service.listUnits();

    expect(mockedExecFile).toHaveBeenCalledWith('systemctl', [
      '--user',
      'list-units',
      '--type=service',
      '--all',
      '--no-legend',
      '--no-pager',
      '--plain',
    ], expect.any(Function));
    expect(units).toEqual([
      {
        name: 'homeserver.service',
        load: 'loaded',
        active: 'active',
        sub: 'running',
        description: 'Homeserver app',
      },
      {
        name: 'backup.timer.service',
        load: 'loaded',
        active: 'inactive',
        sub: 'dead',
        description: 'Backup worker',
      },
    ]);
  });

  it('starts a valid user service unit', async () => {
    mockedExecFile.mockImplementation((_command, _args, callback) => callback(null, '', ''));

    await expect(service.startUnit('homeserver.service')).resolves.toEqual({
      unit: 'homeserver.service',
      action: 'start',
    });
    expect(mockedExecFile).toHaveBeenCalledWith('systemctl', [
      '--user',
      'start',
      'homeserver.service',
    ], expect.any(Function));
  });

  it('stops a valid user service unit', async () => {
    mockedExecFile.mockImplementation((_command, _args, callback) => callback(null, '', ''));

    await expect(service.stopUnit('homeserver.service')).resolves.toEqual({
      unit: 'homeserver.service',
      action: 'stop',
    });
    expect(mockedExecFile).toHaveBeenCalledWith('systemctl', [
      '--user',
      'stop',
      'homeserver.service',
    ], expect.any(Function));
  });

  it('restarts a valid user service unit', async () => {
    mockedExecFile.mockImplementation((_command, _args, callback) => callback(null, '', ''));

    await expect(service.restartUnit('homeserver@prod.service')).resolves.toEqual({
      unit: 'homeserver@prod.service',
      action: 'restart',
    });
    expect(mockedExecFile).toHaveBeenCalledWith('systemctl', [
      '--user',
      'restart',
      'homeserver@prod.service',
    ], expect.any(Function));
  });

  it('rejects invalid unit names', async () => {
    await expect(service.restartUnit('homeserver.service; reboot')).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedExecFile).not.toHaveBeenCalled();
  });

  it('returns systemctl failures as server errors', async () => {
    mockedExecFile.mockImplementation((_command, _args, callback) => callback(new Error('failed'), '', 'unit failed'));

    await expect(service.restartUnit('homeserver.service')).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
