import { OperationType, Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      sender_id
    }) => {
      const partialStatement: any = {
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
      };

      if (type === OperationType.TRANSFER){
        partialStatement.sender_id = sender_id;
      }

      return partialStatement;
    });

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
