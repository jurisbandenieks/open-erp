import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne
} from "typeorm";
import { UserRole, UserStatus, Country } from "./enums";
import { Owner } from "./Owner.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ type: "enum", enum: Country, nullable: true })
  country!: Country;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.PENDING })
  status!: UserStatus;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @Column({ nullable: true, type: "timestamptz" })
  lastLoginAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToOne(() => Owner, (owner) => owner.user)
  owner!: Owner;
}
