import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class statementTransfer1661608398448 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('statement', new TableColumn({
      name: 'sender_id',
      type: 'uuid',
      isNullable: true,
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('statement', 'sender_id')
  }

}
