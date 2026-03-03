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
import { AbsenceType, AbsenceStatus } from "./enums";
import type { Employee } from "./Employee.entity";

@Entity("absences")
@Check(`"endDate" >= "startDate"`)
export class Absence {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Assigned to an employee
  @ManyToOne("Employee", (employee: Employee) => employee.absences, {
    nullable: false,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column()
  employeeId!: string;

  @Column({ type: "enum", enum: AbsenceType })
  type!: AbsenceType;

  @Column({ type: "enum", enum: AbsenceStatus, default: AbsenceStatus.PENDING })
  status!: AbsenceStatus;

  // Date range
  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  // Computed/stored totals
  @Column({ type: "int" })
  totalDays!: number;

  @Column({ nullable: true, type: "decimal", precision: 5, scale: 2 })
  totalHours!: number;

  @Column({ nullable: true })
  notes!: string;

  // Attachments (e.g. doctor notes)
  @Column({ type: "simple-array", nullable: true })
  attachments!: string[];

  // Approval workflow
  @Column({ type: "timestamptz" })
  requestedAt!: Date;

  @Column({ nullable: true })
  reviewedBy!: string;

  @Column({ nullable: true, type: "timestamptz" })
  reviewedAt!: Date;

  @Column({ nullable: true })
  rejectionReason!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
