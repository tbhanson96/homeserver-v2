import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type HealthDocument = HydratedDocument<HealthRecord>;

/**
 * Generic health record.
 */
@Schema({ _id: false })
export class HealthRecord {
  @Prop()
  name: string;

  @Prop()
  units: string;

  @Prop()
  qty?: number;

  // Properties used for HR
  @Prop()
  Avg?: number;

  @Prop()
  Max?: number;

  @Prop()
  Min?: number;

  @Prop()
  source: string;

  @Prop()
  date: Date;
}

/**
 * Sleep Record
 */
@Schema({ _id: false })
export class SleepRecord {
  @Prop()
  qty?: number;

  @Prop()
  source: string;

  @Prop()
  value: SleepType; 

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export enum SleepType {
  IN_BED = 'InBed',
  AWAKE = 'Awake',
  CORE = 'Core',
  DEEP = 'Deep',
  REM = 'REM',
}

export const HealthSchema = SchemaFactory.createForClass(HealthRecord).index({ name: 1, date: 1 }, { unique: true });
export const SleepSchema = SchemaFactory.createForClass(SleepRecord).index({ value: 1, startDate: 1 }, { unique: true });