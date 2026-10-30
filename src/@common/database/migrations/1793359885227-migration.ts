import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793359885227 implements MigrationInterface {
  name = 'Migration1793359885227'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "cpf" character varying(11) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_patients_cpf" UNIQUE ("cpf"), CONSTRAINT "pk_patients" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patients"`)
  }
}
