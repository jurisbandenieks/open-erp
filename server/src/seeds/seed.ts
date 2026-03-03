/**
 * Development seed — run with:
 *   npx ts-node -r dotenv/config src/seeds/seed.ts
 *
 * Default credentials seeded:
 *   Admin    admin@openerp.dev        Password123!
 *   Owner    owner@openerp.dev        Password123!
 *   Manager  alice.manager@openerp.dev  Password123!
 *   Manager  bob.manager@openerp.dev    Password123!
 *   Employee emp1@openerp.dev … emp4@openerp.dev  Password123!
 */

import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { Owner } from "../entities/Owner.entity";
import { Company } from "../entities/Company.entity";
import { Employee } from "../entities/Employee.entity";
import { Manager } from "../entities/Manager.entity";
import { Timelog } from "../entities/Timelog.entity";
import { Absence } from "../entities/Absence.entity";
import { Holiday } from "../entities/Holiday.entity";
import { TimeInLieu } from "../entities/TimeInLieu.entity";
import {
  UserRole,
  UserStatus,
  OwnerStatus,
  CompanyStatus,
  ContractType,
  EmploymentStatus,
  ManagerRole,
  TimelogType,
  TimelogStatus,
  AbsenceType,
  AbsenceStatus,
  HolidayType,
  TimeInLieuStatus,
  Country,
} from "../entities/enums";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hash = (plain: string) => bcrypt.hashSync(plain, 10);

/** ISO date string → Date */
const d = (iso: string) => new Date(iso);

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await AppDataSource.initialize();
  console.log("✔  Database connected");

  // ── 1. Clear tables (safe order — children first) ────────────────────────
  await AppDataSource.query(`
    TRUNCATE TABLE
      time_in_lieus,
      absences,
      timelogs,
      manager_employees,
      employees,
      managers,
      companies,
      owners,
      users,
      holidays
    RESTART IDENTITY CASCADE;
  `);
  console.log("✔  Tables cleared");

  const password = hash("Password123!");

  // ── 2. Users ──────────────────────────────────────────────────────────────

  const userRepo = AppDataSource.getRepository(User);

  const adminUser = userRepo.create({
    email: "admin@openerp.dev",
    password,
    firstName: "System",
    lastName: "Admin",
    phoneNumber: "+1-555-000-0000",
    address: "1 Admin Street",
    country: Country.US,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });

  const ownerUser = userRepo.create({
    email: "owner@openerp.dev",
    password,
    firstName: "James",
    lastName: "Hartwell",
    phoneNumber: "+1-555-100-0001",
    address: "42 Enterprise Ave, New York",
    country: Country.US,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });

  const managerUser1 = userRepo.create({
    email: "alice.manager@openerp.dev",
    password,
    firstName: "Alice",
    lastName: "Spencer",
    phoneNumber: "+44-20-7946-0001",
    address: "10 Downing Lane, London",
    country: Country.GB,
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });

  const managerUser2 = userRepo.create({
    email: "bob.manager@openerp.dev",
    password,
    firstName: "Robert",
    lastName: "Tanner",
    phoneNumber: "+44-20-7946-0002",
    address: "22 Baker Road, Manchester",
    country: Country.GB,
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
  });

  const empUsers = [
    userRepo.create({
      email: "emp1@openerp.dev",
      password,
      firstName: "Sophie",
      lastName: "Müller",
      phoneNumber: "+49-30-1000-0001",
      address: "Hauptstraße 1, Berlin",
      country: Country.DE,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    }),
    userRepo.create({
      email: "emp2@openerp.dev",
      password,
      firstName: "Luca",
      lastName: "Rossi",
      phoneNumber: "+39-06-1000-0002",
      address: "Via Roma 2, Milan",
      country: Country.IT,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    }),
    userRepo.create({
      email: "emp3@openerp.dev",
      password,
      firstName: "Mia",
      lastName: "Johansson",
      phoneNumber: "+46-8-1000-0003",
      address: "Storgatan 3, Stockholm",
      country: Country.SE,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    }),
    userRepo.create({
      email: "emp4@openerp.dev",
      password,
      firstName: "Carlos",
      lastName: "García",
      phoneNumber: "+34-91-1000-0004",
      address: "Calle Mayor 4, Madrid",
      country: Country.ES,
      role: UserRole.USER,
      status: UserStatus.PENDING,
      emailVerified: false,
    }),
  ];

  await userRepo.save([adminUser, ownerUser, managerUser1, managerUser2, ...empUsers]);
  console.log("✔  Users seeded (8)");

  // ── 3. Owner ──────────────────────────────────────────────────────────────

  const ownerRepo = AppDataSource.getRepository(Owner);

  const owner = ownerRepo.create({
    userId: ownerUser.id,
    status: OwnerStatus.ACTIVE,
    displayName: "Hartwell Enterprises LLC",
    taxId: "EIN-12-3456789",
    metadata: { tier: "enterprise", onboardedAt: "2022-01-15" },
  });

  await ownerRepo.save(owner);
  console.log("✔  Owner seeded");

  // ── 4. Company ────────────────────────────────────────────────────────────

  const companyRepo = AppDataSource.getRepository(Company);

  const company = companyRepo.create({
    ownerId: owner.id,
    name: "Hartwell Tech Solutions",
    registrationNumber: "HTS-2022-001",
    vatNumber: "GB123456789",
    status: CompanyStatus.ACTIVE,
    description: "Full-stack software development and ERP consulting.",
    website: "https://hartwelltech.dev",
    phone: "+1-555-200-0100",
    email: "contact@hartwelltech.dev",
    address: "100 Tech Blvd, Suite 400",
    city: "New York",
    country: Country.US,
    currency: "USD",
    foundedAt: d("2022-03-01"),
  });

  await companyRepo.save(company);
  console.log("✔  Company seeded");

  // ── 5. Employees ──────────────────────────────────────────────────────────

  const empRepo = AppDataSource.getRepository(Employee);

  const employees = empRepo.create([
    {
      userId: empUsers[0].id,
      companyId: company.id,
      employeeNumber: "EMP-0001",
      hireDate: d("2022-06-01"),
      position: "Senior Frontend Developer",
      department: "Engineering",
      status: EmploymentStatus.ACTIVE,
      contractType: ContractType.FULL_TIME,
      salary: 85000,
      workingHoursPerWeek: 40,
      emergencyContact: {
        name: "Hans Müller",
        relationship: "Spouse",
        phoneNumber: "+49-30-9999-0001",
      },
    },
    {
      userId: empUsers[1].id,
      companyId: company.id,
      employeeNumber: "EMP-0002",
      hireDate: d("2023-01-16"),
      position: "Backend Developer",
      department: "Engineering",
      status: EmploymentStatus.ACTIVE,
      contractType: ContractType.FULL_TIME,
      salary: 78000,
      workingHoursPerWeek: 40,
      emergencyContact: {
        name: "Maria Rossi",
        relationship: "Mother",
        phoneNumber: "+39-06-9999-0002",
      },
    },
    {
      userId: empUsers[2].id,
      companyId: company.id,
      employeeNumber: "EMP-0003",
      hireDate: d("2023-05-01"),
      position: "UX Designer",
      department: "Product",
      status: EmploymentStatus.ON_LEAVE,
      contractType: ContractType.PART_TIME,
      salary: 55000,
      workingHoursPerWeek: 20,
      emergencyContact: {
        name: "Erik Johansson",
        relationship: "Father",
        phoneNumber: "+46-8-9999-0003",
      },
    },
    {
      userId: empUsers[3].id,
      companyId: company.id,
      employeeNumber: "EMP-0004",
      hireDate: d("2024-02-12"),
      position: "Junior QA Engineer",
      department: "Quality Assurance",
      status: EmploymentStatus.ACTIVE,
      contractType: ContractType.INTERN,
      salary: 32000,
      workingHoursPerWeek: 40,
      emergencyContact: {
        name: "Isabel García",
        relationship: "Sister",
        phoneNumber: "+34-91-9999-0004",
      },
    },
  ]);

  await empRepo.save(employees);
  console.log("✔  Employees seeded (4)");

  // ── 6. Managers ───────────────────────────────────────────────────────────

  const managerRepo = AppDataSource.getRepository(Manager);

  const manager1 = managerRepo.create({
    userId: managerUser1.id,
    companyId: company.id,
    role: ManagerRole.PRIMARY,
    position: "Engineering Manager",
    department: "Engineering",
    isActive: true,
    employees: [employees[0], employees[1]],
  });

  const manager2 = managerRepo.create({
    userId: managerUser2.id,
    companyId: company.id,
    role: ManagerRole.PROJECT_MANAGER,
    position: "Product & QA Manager",
    department: "Product",
    isActive: true,
    employees: [employees[2], employees[3]],
  });

  await managerRepo.save([manager1, manager2]);
  console.log("✔  Managers seeded (2) with employee relations");

  // ── 7. Timelogs ───────────────────────────────────────────────────────────

  const timelogRepo = AppDataSource.getRepository(Timelog);

  const timelogs = timelogRepo.create([
    // Employee 1 — standard week
    {
      employeeId: employees[0].id,
      date: d("2026-02-24"),
      totalHours: 8,
      type: TimelogType.STANDARD,
      status: TimelogStatus.APPROVED,
      description: "Sprint planning + feature development",
      isRemote: true,
      approved: true,
      approvedBy: manager1.id,
      approvedAt: d("2026-02-25T09:00:00Z"),
      billable: true,
      billableHours: 8,
      hourlyRate: 95,
    },
    {
      employeeId: employees[0].id,
      date: d("2026-02-25"),
      totalHours: 9.5,
      type: TimelogType.OVERTIME,
      status: TimelogStatus.APPROVED,
      description: "Hotfix deployment and postmortem",
      isRemote: false,
      location: "HQ - Engineering Floor",
      approved: true,
      approvedBy: manager1.id,
      approvedAt: d("2026-02-26T10:00:00Z"),
      billable: true,
      billableHours: 9.5,
      hourlyRate: 95,
    },
    {
      employeeId: employees[0].id,
      date: d("2026-02-26"),
      totalHours: 8,
      type: TimelogType.STANDARD,
      status: TimelogStatus.SUBMITTED,
      description: "Code review and PR merges",
      isRemote: true,
      approved: false,
    },
    // Employee 2
    {
      employeeId: employees[1].id,
      date: d("2026-02-24"),
      totalHours: 8,
      type: TimelogType.STANDARD,
      status: TimelogStatus.APPROVED,
      description: "API endpoint implementation",
      isRemote: false,
      location: "HQ - Engineering Floor",
      approved: true,
      approvedBy: manager1.id,
      approvedAt: d("2026-02-25T09:30:00Z"),
      billable: true,
      billableHours: 8,
      hourlyRate: 85,
    },
    {
      employeeId: employees[1].id,
      date: d("2026-02-25"),
      totalHours: 2,
      type: TimelogType.SICK,
      status: TimelogStatus.APPROVED,
      description: "Sick — half day",
      isRemote: false,
      approved: true,
      approvedBy: manager1.id,
      approvedAt: d("2026-02-26T08:00:00Z"),
      billable: false,
    },
    // Employee 4 — draft
    {
      employeeId: employees[3].id,
      date: d("2026-02-24"),
      totalHours: 7.5,
      type: TimelogType.STANDARD,
      status: TimelogStatus.DRAFT,
      description: "Test case writing for auth module",
      isRemote: true,
      approved: false,
    },
    // Manager 1 log
    {
      managerId: manager1.id,
      date: d("2026-02-24"),
      totalHours: 8,
      type: TimelogType.STANDARD,
      status: TimelogStatus.APPROVED,
      description: "1-on-1s, sprint review, stakeholder meeting",
      isRemote: false,
      location: "HQ - Boardroom",
      approved: true,
      approvedBy: adminUser.id,
      approvedAt: d("2026-02-25T11:00:00Z"),
      billable: false,
    },
  ]);

  await timelogRepo.save(timelogs);
  console.log("✔  Timelogs seeded (7)");

  // ── 8. Absences ───────────────────────────────────────────────────────────

  const absenceRepo = AppDataSource.getRepository(Absence);

  const absences = absenceRepo.create([
    // Employee 3 — maternity leave (explains ON_LEAVE status)
    {
      employeeId: employees[2].id,
      type: AbsenceType.MATERNITY,
      status: AbsenceStatus.APPROVED,
      startDate: d("2026-01-06"),
      endDate: d("2026-04-05"),
      totalDays: 65,
      totalHours: 520,
      notes: "Standard 13-week maternity leave",
      requestedAt: d("2025-11-01T10:00:00Z"),
      reviewedBy: manager2.id,
      reviewedAt: d("2025-11-05T14:00:00Z"),
    },
    // Employee 1 — approved vacation
    {
      employeeId: employees[0].id,
      type: AbsenceType.VACATION,
      status: AbsenceStatus.APPROVED,
      startDate: d("2026-03-16"),
      endDate: d("2026-03-20"),
      totalDays: 5,
      totalHours: 40,
      notes: "Spring holiday",
      requestedAt: d("2026-02-15T09:00:00Z"),
      reviewedBy: manager1.id,
      reviewedAt: d("2026-02-16T10:00:00Z"),
    },
    // Employee 2 — pending sick leave
    {
      employeeId: employees[1].id,
      type: AbsenceType.SICK_LEAVE,
      status: AbsenceStatus.PENDING,
      startDate: d("2026-03-03"),
      endDate: d("2026-03-04"),
      totalDays: 2,
      totalHours: 16,
      notes: "Flu — doctor note attached",
      requestedAt: d("2026-03-03T07:30:00Z"),
    },
    // Employee 4 — time in lieu (linked later)
    {
      employeeId: employees[3].id,
      type: AbsenceType.TIME_IN_LIEU,
      status: AbsenceStatus.PENDING,
      startDate: d("2026-03-10"),
      endDate: d("2026-03-10"),
      totalDays: 1,
      totalHours: 7.5,
      notes: "Using overtime earned from February sprint",
      requestedAt: d("2026-03-01T08:00:00Z"),
    },
  ]);

  await absenceRepo.save(absences);
  console.log("✔  Absences seeded (4)");

  // ── 9. TimeInLieu ────────────────────────────────────────────────────────

  const tilRepo = AppDataSource.getRepository(TimeInLieu);

  // Employee 4 earned overtime hours and is using them via absence[3]
  const til1 = tilRepo.create({
    employeeId: employees[3].id,
    hours: 7.5,
    earnedDate: d("2026-02-20"),
    reason: "Extra hours during February production deployment sprint",
    status: TimeInLieuStatus.APPROVED,
    hoursUsed: 7.5,
    usedDate: d("2026-03-10"),
    absenceId: absences[3].id,
    expiryDate: d("2026-08-20"),
    approvedBy: manager2.id,
    approvedAt: d("2026-03-01T12:00:00Z"),
    notes: "Approved during Q1 review",
  });

  // Employee 1 — banked overtime, not yet used
  const til2 = tilRepo.create({
    employeeId: employees[0].id,
    hours: 9.5,
    earnedDate: d("2026-02-25"),
    reason: "Hotfix weekend deployment",
    status: TimeInLieuStatus.APPROVED,
    hoursUsed: 0,
    expiryDate: d("2026-08-25"),
    approvedBy: manager1.id,
    approvedAt: d("2026-02-26T09:00:00Z"),
    notes: "Available to use before August",
  });

  await tilRepo.save([til1, til2]);
  console.log("✔  TimeInLieu seeded (2)");

  // ── 10. Holidays ─────────────────────────────────────────────────────────

  const holidayRepo = AppDataSource.getRepository(Holiday);

  const holidays = holidayRepo.create([
    {
      name: "New Year's Day",
      type: HolidayType.PUBLIC,
      date: d("2026-01-01"),
      country: Country.US,
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: adminUser.id,
    },
    {
      name: "Independence Day",
      type: HolidayType.NATIONAL,
      date: d("2026-07-04"),
      country: Country.US,
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: adminUser.id,
    },
    {
      name: "Thanksgiving Day",
      type: HolidayType.NATIONAL,
      date: d("2026-11-26"),
      country: Country.US,
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: adminUser.id,
    },
    {
      name: "Christmas Day",
      type: HolidayType.PUBLIC,
      date: d("2026-12-25"),
      country: Country.US,
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: adminUser.id,
    },
    // UK holidays for British managers
    {
      name: "Bank Holiday — Spring",
      type: HolidayType.PUBLIC,
      date: d("2026-05-25"),
      country: Country.GB,
      region: "England and Wales",
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: adminUser.id,
    },
    // Company-specific holiday
    {
      name: "Company Founding Day",
      type: HolidayType.COMPANY,
      date: d("2026-03-01"),
      companyId: company.id,
      description: "Celebrating 4 years of Hartwell Tech Solutions",
      isRecurring: true,
      isObserved: true,
      isPaid: true,
      createdBy: ownerUser.id,
    },
  ]);

  await holidayRepo.save(holidays);
  console.log("✔  Holidays seeded (6)");

  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🌱  Seed complete!\n");
  console.log("  Credentials (all use password: Password123!)");
  console.log("  ─────────────────────────────────────────────");
  console.log("  admin@openerp.dev          (Admin)");
  console.log("  owner@openerp.dev          (Owner)");
  console.log("  alice.manager@openerp.dev  (Engineering Manager)");
  console.log("  bob.manager@openerp.dev    (Product & QA Manager)");
  console.log("  emp1@openerp.dev           (Senior Frontend Dev)");
  console.log("  emp2@openerp.dev           (Backend Developer)");
  console.log("  emp3@openerp.dev           (UX Designer — on leave)");
  console.log("  emp4@openerp.dev           (Junior QA — intern)\n");

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
