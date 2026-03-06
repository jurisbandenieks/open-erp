import type { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserRole } from "@shared/entities/enums";
import { env } from "../config/env";

/**
 * Production migration — seeds the initial sysadmin user.
 *
 * Required env vars before running:
 *   SYSADMIN_EMAIL     (default: sysadmin@openerp.local)
 *   SYSADMIN_PASSWORD  (required — no default, will throw if missing)
 *
 * Run:
 *   npm run migration:run
 *
 * Revert:
 *   npm run migration:revert
 */
export class SeedSysadmin1772668800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = env.SYSADMIN_EMAIL ?? "sysadmin@openerp.local";

    const plainPassword = env.SYSADMIN_PASSWORD;
    if (!plainPassword) {
      console.warn(
        "[SeedSysadmin] SYSADMIN_PASSWORD env var not set — skipping sysadmin seed"
      );
      return;
    }

    const password = await bcrypt.hash(plainPassword, 12);

    // Check if already exists — idempotent
    const existing = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (existing.length > 0) {
      console.log(
        `[SeedSysadmin] Sysadmin "${email}" already exists — skipping`
      );
      return;
    }

    await queryRunner.query(
      `INSERT INTO users (id, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'System', 'Admin', '${UserRole.SYSADMIN}', 'active', NOW(), NOW())`,
      [email, password]
    );

    console.log(`[SeedSysadmin] Sysadmin "${email}" created`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.SYSADMIN_EMAIL ?? "sysadmin@openerp.local";

    await queryRunner.query(
      `DELETE FROM users WHERE email = $1 AND role = '${UserRole.SYSADMIN}'`,
      [email]
    );

    console.log(`[SeedSysadmin] Sysadmin "${email}" removed`);
  }
}
