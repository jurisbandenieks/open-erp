import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn
} from "typeorm";
import { TimeInLieuStatus } from "./enums";
import type { Employee } from "./Employee.entity";
import type { Absence } from "./Absence.entity";

@Entity("time_in_lieus")
export class TimeInLieu {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Belongs to an employee
  @ManyToOne("Employee", (employee: Employee) => employee.timeInLieus, {
    nullable: false,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "employeeId" })
  employee!: Employee;

  @Column()
  employeeId!: string;

  // Hours earned for overtime / extra work
  @Column({ type: "decimal", precision: 5, scale: 2 })
  hours!: number;

  @Column({ type: "date" })
  earnedDate!: Date;

  @Column()
  reason!: string;

  @Column({
    type: "enum",
    enum: TimeInLieuStatus,
    default: TimeInLieuStatus.PENDING
  })
  status!: TimeInLieuStatus;

  // Linked to the absence it was applied to (only when type = TIME_IN_LIEU)
  @OneToOne("Absence", (absence: Absence) => absence.timeInLieu, {
    nullable: true,
    onDelete: "SET NULL"
  })
  @JoinColumn({ name: "absenceId" })
  absence!: Absence | null;

  @Column({ nullable: true })
  absenceId!: string | null;

  // Expiry
  // Tracking usage
  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  hoursUsed!: number;

  @Column({ nullable: true, type: "date" })
  usedDate!: Date;

  @Column({ nullable: true, type: "date" })
  expiryDate!: Date;

  // Approval workflow
  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ nullable: true, type: "timestamptz" })
  approvedAt!: Date;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
