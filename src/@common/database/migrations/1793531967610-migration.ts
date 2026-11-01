import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793531967610 implements MigrationInterface {
  name = 'Migration1793531967610'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "work_shifts" ("id" SERIAL NOT NULL, "week_day" integer NOT NULL, "start_time" character varying(5) NOT NULL, "end_time" character varying(5) NOT NULL, "slot_duration_minutes" integer NOT NULL, "doctor_id" integer, CONSTRAINT "pk_work_shifts" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "work_shifts" ADD CONSTRAINT "fk_work_shifts_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_shifts" DROP CONSTRAINT "fk_work_shifts_doctor_id"`,
    )
    await queryRunner.query(`DROP TABLE "work_shifts"`)
  }
}
