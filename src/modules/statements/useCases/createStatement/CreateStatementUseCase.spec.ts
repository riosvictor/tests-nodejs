import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("make deposit or withdraw", () => {
  let repoStatement;
  let repoUser;
  let useCase: CreateStatementUseCase;
  let userUseCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  const statementData = {
    user_id: '123',
    description: "deposit",
    amount: 100,
    type: OperationType.DEPOSIT
  };

  beforeEach(() => {
    repoStatement = new InMemoryStatementsRepository();
    repoUser = new InMemoryUsersRepository();

    useCase = new CreateStatementUseCase(repoUser, repoStatement);
    userUseCase = new CreateUserUseCase(repoUser);
  });

  it("success insert value", async () => {
    const user = await userUseCase.execute(userData);

    statementData.user_id = user.id!;

    const statement = await useCase.execute(statementData);

    expect(statement).not.toBeNull();
    expect(statement).toHaveProperty("id");
  });

  it("success remove value", async () => {
    const user = await userUseCase.execute(userData);

    statementData.user_id = user.id!;

    await useCase.execute(statementData);

    statementData.description = "withdraw";
    statementData.type = OperationType.WITHDRAW;

    const statement = await useCase.execute(statementData);

    expect(statement).not.toBeNull();
    expect(statement).toHaveProperty("id");
  });

  it("user not found", async () => {
    await expect(useCase.execute(statementData))
      .rejects
      .toEqual(new CreateStatementError.UserNotFound());
  });

  it("insufficient founds", async () => {
    await expect(async () => {
      const user = await userUseCase.execute(userData);

      statementData.user_id = user.id!;
      statementData.amount = 50;

      await useCase.execute(statementData);

      statementData.description = "withdraw";
      statementData.type = OperationType.WITHDRAW;
      statementData.amount = 100;

      await useCase.execute(statementData);
    })
      .rejects
      .toEqual(new CreateStatementError.InsufficientFunds());
  });
})
