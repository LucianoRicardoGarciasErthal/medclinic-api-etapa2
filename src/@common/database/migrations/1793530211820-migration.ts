import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793530211820 implements MigrationInterface {
  name = 'Migration1793530211820'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctors" ("id" SERIAL NOT NULL, "crm" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "uq_doctors_crm" UNIQUE ("crm"), CONSTRAINT "rel_doctors_user_id" UNIQUE ("user_id"), CONSTRAINT "pk_doctors" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD CONSTRAINT "fk_doctors_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP CONSTRAINT "fk_doctors_user_id"`,
    )
    await queryRunner.query(`DROP TABLE "doctors"`)
  }
}
