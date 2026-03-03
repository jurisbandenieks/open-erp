import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToOne,
  JoinColumn
} from "typeorm";
import { EmploymentStatus, ContractType } from "./enums";
import { User } from "./User.entity";
import type { Company } from "./Company.entity";
import type { Manager } from "./Manager.entity";

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
  @ManyToOne("Company", { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  companyId!: string;

  // Many employees ↔ many managers (inverse side)
  @ManyToMany("Manager", (manager: Manager) => manager.employees)
  managers!: Manager[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
