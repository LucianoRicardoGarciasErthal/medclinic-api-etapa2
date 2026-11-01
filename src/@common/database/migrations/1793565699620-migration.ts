import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793565699620 implements MigrationInterface {
  name = 'Migration1793565699620'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'in_progress', 'done', 'cancelled')`,
    )
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "patient_id" integer, CONSTRAINT "pk_appointments" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "fk_appointments_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_patient_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "fk_appointments_doctor_id"`,
    )
    await queryRunner.query(`DROP TABLE "appointments"`)
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`)
  }
}
