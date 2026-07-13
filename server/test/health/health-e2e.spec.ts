jest.mock('fs', () => {
  return require('memfs').fs;
});
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ApiKeyGuard } from '../../src/auth/apikey.guard';
import { JwtGuard } from '../../src/auth/jwt.guard';
import { HealthService } from '../../src/health/health.service';
import { SleepType } from '../../src/models/health';
import { RawHealthData, RawSleepData } from '../../src/models/rawHealthData';
import { setupMockFs } from '../mock-helper';

const SAMPLE_HEALTH_DATA: RawHealthData = {
  data: {
    metrics: [
      {
        name: 'basal_energy_burned',
        units: 'kcal',
        data: [
          {
            date: new Date('2026-01-01T01:00:00.000Z'),
            qty: 1500,
            source: 'watch',
          },
          {
            date: new Date('2026-01-01T02:00:00.000Z'),
            qty: 1650,
            source: 'watch',
          },
        ],
      },
      {
        name: 'active_energy',
        units: 'kcal',
        data: [
          {
            date: new Date('2026-01-01T01:00:00.000Z'),
            qty: 300,
            source: 'watch',
          },
          {
            date: new Date('2026-01-01T02:00:00.000Z'),
            qty: 450,
            source: 'watch',
          },
        ],
      },
      {
        name: 'heart_rate',
        units: 'count/min',
        data: [
          {
            date: new Date('2026-01-01T01:00:00.000Z'),
            Avg: 62,
            Min: 58,
            Max: 67,
            source: 'watch',
          },
        ],
      },
    ],
  },
};

const SAMPLE_SLEEP_DATA: RawSleepData = {
  data: {
    metrics: [
      {
        name: 'sleep',
        units: 'stage',
        data: [
          {
            value: SleepType.CORE,
            source: 'watch',
            startDate: new Date('2026-01-02T06:00:00.000Z'),
            endDate: new Date('2026-01-02T07:30:00.000Z'),
          },
          {
            value: SleepType.AWAKE,
            source: 'watch',
            startDate: new Date('2026-01-02T07:30:00.000Z'),
            endDate: new Date('2026-01-02T07:45:00.000Z'),
          },
          {
            value: SleepType.REM,
            source: 'watch',
            startDate: new Date('2026-01-02T07:45:00.000Z'),
            endDate: new Date('2026-01-02T08:45:00.000Z'),
          },
        ],
      },
    ],
  },
};

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setupMockFs();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.get(JwtGuard).canActivate = () => Promise.resolve(true);
    app.get(ApiKeyGuard).canActivate = () => Promise.resolve(true);
    await app.init();

    await app.get(HealthService).importHealthData(SAMPLE_HEALTH_DATA);
    await app.get(HealthService).importSleepData(SAMPLE_SLEEP_DATA);
  });

  afterAll(async () => {
    await app.close();
    jest.unmock('fs');
  });

  it('POST /api/health accepts imports immediately', async () => {
    await request(app.getHttpServer())
      .post('/api/health')
      .send(SAMPLE_HEALTH_DATA)
      .expect(202);
  });

  it('GET /api/health/catalog includes synthetic metrics', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/catalog')
      .expect(200);

    const totalEnergy = response.body.metrics.find((metric: { name: string }) => metric.name === 'total_energy');
    expect(totalEnergy).toBeTruthy();
    expect(totalEnergy.units).toBe('kcal');
    expect(totalEnergy.latestValue).toBe(2100);
    expect(totalEnergy.recordCount).toBe(4);
    expect(response.body.sleepRecordCount).toBe(3);
  });

  it('GET /api/health returns synthetic metric series', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .query({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-01T03:00:00.000Z',
        metrics: ['total_energy'],
      })
      .expect(200);

    expect(response.body.metrics.total_energy.units).toBe('kcal');
    expect(response.body.metrics.total_energy.data).toHaveLength(2);
    expect(response.body.metrics.total_energy.data[0].qty).toBe(1800);
    expect(response.body.metrics.total_energy.data[1].qty).toBe(2100);
  });

  it('GET /api/health/dashboard aggregates synthetic metrics', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/dashboard')
      .query({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-01T03:00:00.000Z',
        aggregation: 'hourly',
        metrics: ['total_energy'],
      })
      .expect(200);

    const summary = response.body.metrics.total_energy;
    expect(summary.units).toBe('kcal');
    expect(summary.recordCount).toBe(4);
    expect(summary.latestValue).toBe(2100);
    expect(summary.totalValue).toBe(3900);
    expect(summary.buckets).toHaveLength(2);
    expect(summary.buckets[0].sumValue).toBe(1800);
    expect(summary.buckets[1].sumValue).toBe(2100);
  });

  it('GET /api/health/sleep/summary aggregates sleep stages and nights', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/sleep/summary')
      .query({
        from: '2026-01-02T06:30:00.000Z',
        to: '2026-01-02T09:00:00.000Z',
      })
      .expect(200);

    expect(response.body.recordCount).toBe(3);
    expect(response.body.totalMinutes).toBe(135);
    expect(response.body.asleepMinutes).toBe(120);
    expect(response.body.awakeMinutes).toBe(15);
    expect(response.body.stageSummaries).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: SleepType.CORE, totalMinutes: 60 }),
      expect.objectContaining({ value: SleepType.AWAKE, totalMinutes: 15 }),
      expect.objectContaining({ value: SleepType.REM, totalMinutes: 60 }),
    ]));
    expect(response.body.nights).toHaveLength(1);
    expect(response.body.nights[0]).toEqual(expect.objectContaining({
      date: '2026-01-01',
      segmentCount: 3,
      asleepMinutes: 120,
      awakeMinutes: 15,
    }));
  });
});
