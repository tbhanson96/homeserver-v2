import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type HealthDocument = HydratedDocument<HealthRecord>;

@Schema()
export class HealthRecord {
  @Prop()
  name: string;

  @Prop()
  units: string;

  @Prop()
  qty?: number;

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

export const HealthSchema = SchemaFactory.createForClass(HealthRecord);