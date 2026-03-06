import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check
} from "typeorm";
import { TimelogType, TimelogStatus } from "./enums";
import type { Employee } from "./Employee.entity";

@Entity("timelogs")
@Check(`("employeeId" IS NOT NULL OR "managerId" IS NOT NULL)`)
export class Timelog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Regular employee timelog (nullable — either employee or manager must be set)
  @ManyToOne("Employee", (employee: Employee) => employee.timelogs, {
    nullable: true,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee | null;

  @Column({ nullable: true })
  employeeId!: string | null;

  // Manager timelog — references an Employee who is a manager
  @ManyToOne("Employee", (employee: Employee) => employee.managedTimelogs, {
    nullable: true,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "managerId" })
  manager!: Employee | null;

  @Column({ nullable: true })
  managerId!: string | null;

  @Column({ type: "date" })
  date!: Date;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  totalHours!: number;

  @Column({ type: "enum", enum: TimelogType, default: TimelogType.STANDARD })
  type!: TimelogType;

  @Column({ type: "enum", enum: TimelogStatus, default: TimelogStatus.DRAFT })
  status!: TimelogStatus;

  // Work details
  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  notes!: string;

  @Column({ type: "simple-array", nullable: true })
  taskIds!: string[];

  // Location
  @Column({ nullable: true })
  location!: string;

  @Column({ default: false })
  isRemote!: boolean;

  // Approval
  @Column({ default: false })
  approved!: boolean;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true, type: "timestamptz" })
  approvedAt!: Date;

  @Column({ nullable: true })
  rejectionReason!: string;

  // Billing
  @Column({ default: false })
  billable!: boolean;

  @Column({ nullable: true, type: "decimal", precision: 5, scale: 2 })
  billableHours!: number;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  hourlyRate!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
