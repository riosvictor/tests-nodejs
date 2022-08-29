import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, receiver_user_id, type, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);
    const hasReceiverId = !!receiver_user_id && receiver_user_id.length > 0;

    if (type === OperationType.TRANSFER) {
      if (!hasReceiverId) {
        throw new CreateStatementError.UserNotFound();
      }

      const receiver = await this.usersRepository.findById(receiver_user_id);

      if (!receiver) {
        throw new CreateStatementError.UserNotFound();
      }
    }

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(type === OperationType.WITHDRAW || type === OperationType.TRANSFER) {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      receiver_user_id
    });

    return statementOperation;
  }
}
