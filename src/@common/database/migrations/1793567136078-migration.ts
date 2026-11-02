import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793567136078 implements MigrationInterface {
  name = 'Migration1793567136078'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medical_records" ("id" SERIAL NOT NULL, "text" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "patient_id" integer, CONSTRAINT "pk_medical_records" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "fk_medical_records_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "fk_medical_records_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "fk_medical_records_patient_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "fk_medical_records_doctor_id"`,
    )
    await queryRunner.query(`DROP TABLE "medical_records"`)
  }
}
