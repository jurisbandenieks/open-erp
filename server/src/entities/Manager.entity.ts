import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable
} from "typeorm";
import { ManagerRole } from "./enums";
import { User } from "./User.entity";
import type { Company } from "./Company.entity";
import type { Employee } from "./Employee.entity";
import type { Timelog } from "./Timelog.entity";

@Entity("managers")
export class Manager {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Manager identity → one-to-one with User
  @OneToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  // Manager belongs to a Company
  @ManyToOne("Company", { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  companyId!: string;

  // Manager ↔ Employee many-to-many (owning side)
  @ManyToMany("Employee", (employee: Employee) => employee.managers, {
    cascade: ["insert", "update"]
  })
  @JoinTable({
    name: "manager_employees",
    joinColumn: { name: "managerId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "employeeId", referencedColumnName: "id" }
  })
  employees!: Employee[];

  @Column({ type: "enum", enum: ManagerRole, default: ManagerRole.PRIMARY })
  role!: ManagerRole;

  @Column({ nullable: true })
  position!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ default: true })
  isActive!: boolean;

  // One manager → many timelogs
  @OneToMany("Timelog", (timelog: Timelog) => timelog.manager)
  timelogs!: Timelog[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
