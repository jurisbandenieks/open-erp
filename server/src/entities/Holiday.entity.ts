import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { HolidayType, Country } from "./enums";
import type { Company } from "./Company.entity";

@Entity("holidays")
export class Holiday {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "enum", enum: HolidayType })
  type!: HolidayType;

  @Column({ type: "date" })
  date!: Date;

  @Column({ nullable: true })
  description!: string;

  // Scope — optional link to a specific company (company holidays)
  @ManyToOne("Company", { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "companyId" })
  company!: Company | null;

  @Column({ nullable: true })
  companyId!: string | null;

  // Location scope
  @Column({ nullable: true })
  region!: string;

  @Column({ type: "enum", enum: Country, nullable: true })
  country!: Country | null;

  // Recurrence
  @Column({ default: false })
  isRecurring!: boolean;

  // Observance
  @Column({ default: true })
  isObserved!: boolean;

  @Column({ default: true })
  isPaid!: boolean;

  // Additional
  @Column({ nullable: true })
  notes!: string;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
