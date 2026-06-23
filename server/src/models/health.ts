import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Generic health record.
 */
@Entity({ name: 'health_records' })
@Index(['name', 'date'], { unique: true })
export class HealthRecord {
  @PrimaryColumn()
  name: string;

  @Column()
  units: string;

  @Column({ type: 'real', nullable: true })
  qty?: number;

  // Properties used for HR
  @Column({ type: 'real', nullable: true })
  Avg?: number;

  @Column({ type: 'real', nullable: true })
  Max?: number;

  @Column({ type: 'real', nullable: true })
  Min?: number;

  @Column()
  source: string;

  @PrimaryColumn({ type: 'datetime' })
  date: Date;
}

/**
 * Sleep Record
 */
@Entity({ name: 'sleep_records' })
@Index(['value', 'startDate'], { unique: true })
export class SleepRecord {
  @Column({ type: 'real', nullable: true })
  qty?: number;

  @Column()
  source: string;

  @PrimaryColumn()
  value: SleepType;

  @PrimaryColumn({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;
}

export enum SleepType {
  IN_BED = 'InBed',
  AWAKE = 'Awake',
  CORE = 'Core',
  DEEP = 'Deep',
  REM = 'REM',
}
