import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToOne,
  OneToMany,
  JoinColumn,
  JoinTable
} from "typeorm";
import { EmploymentStatus, ContractType } from "./enums";
import { User } from "./User.entity";
import { Company } from "./Company.entity";
import { Timelog } from "./Timelog.entity";
import { Absence } from "./Absence.entity";
import { TimeInLieu } from "./TimeInLieu.entity";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Every employee must have a User account — personal info (name, email, avatar) lives there
  @OneToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  @Column({ unique: true })
  employeeNumber!: string;

  @Column({ nullable: true, type: "date" })
  dateOfBirth!: Date;

  @Column({ type: "date" })
  hireDate!: Date;

  @Column({ nullable: true, type: "date" })
  terminationDate!: Date;

  @Column()
  position!: string;

  @Column()
  department!: string;

  @Column({
    type: "enum",
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE
  })
  status!: EmploymentStatus;

  @Column({ type: "enum", enum: ContractType, default: ContractType.FULL_TIME })
  contractType!: ContractType;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  salary!: number;

  @Column({ nullable: true, type: "int" })
  workingHoursPerWeek!: number;

  @Column({ type: "jsonb", nullable: true })
  emergencyContact!: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  // Many employees → one Company
  @ManyToOne(() => Company, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  companyId!: string;

  // Self-referential M2M: an employee can manage other employees.
  // Owning side — rows in "employee_managers" mean: managerId manages employeeId
  @ManyToMany(() => Employee, (employee) => employee.managedBy, {
    cascade: ["insert", "update"]
  })
  @JoinTable({
    name: "employee_managers",
    joinColumn: { name: "managerId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "employeeId", referencedColumnName: "id" }
  })
  manages!: Employee[]; // employees that this person manages

  // Inverse side: managers of this employee
  @ManyToMany(() => Employee, (employee) => employee.manages)
  managedBy!: Employee[];

  // One employee → many timelogs (as regular employee)
  @OneToMany(() => Timelog, (timelog: Timelog) => timelog.employee)
  timelogs!: Timelog[];

  // One employee → many timelogs (as manager)
  @OneToMany(() => Timelog, (timelog: Timelog) => timelog.manager)
  managedTimelogs!: Timelog[];

  // One employee → many absences
  @OneToMany(() => Absence, (absence: Absence) => absence.employee)
  absences!: Absence[];

  // One employee → many time-in-lieu records
  @OneToMany(() => TimeInLieu, (til: TimeInLieu) => til.employee)
  timeInLieus!: TimeInLieu[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
