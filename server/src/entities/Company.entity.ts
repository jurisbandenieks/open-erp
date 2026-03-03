import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { CompanyStatus, Country } from "./enums";
import type { Owner } from "./Owner.entity";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  registrationNumber!: string;

  @Column({ nullable: true })
  vatNumber!: string;

  @Column({ type: "enum", enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status!: CompanyStatus;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ type: "enum", enum: Country, nullable: true })
  country!: Country;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ nullable: true })
  currency!: string;

  @Column({ nullable: true, type: "timestamptz" })
  foundedAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  // Many companies → one Owner
  @ManyToOne("Owner", (owner: Owner) => owner.companies, {
    nullable: false,
    onDelete: "RESTRICT"
  })
  @JoinColumn({ name: "ownerId" })
  owner!: Owner;

  @Column()
  ownerId!: string;
}
