import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn
} from "typeorm";
import { User } from "./User.entity";
import { OwnerStatus, Country } from "./enums";
import type { Company } from "./Company.entity";

@Entity("owners")
export class Owner {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // One Owner → one User (Owner IS a User)
  @OneToOne(() => User, (user) => user.owner, {
    nullable: false,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  // One Owner → many Companies
  @OneToMany("Company", (company: Company) => company.owner, {
    cascade: true,
    eager: false
  })
  companies!: Company[];

  @Column({ type: "enum", enum: OwnerStatus, default: OwnerStatus.ACTIVE })
  status!: OwnerStatus;

  @Column({ nullable: true })
  displayName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: "enum", enum: Country, nullable: true })
  country!: Country;

  @Column({ nullable: true })
  taxId!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
