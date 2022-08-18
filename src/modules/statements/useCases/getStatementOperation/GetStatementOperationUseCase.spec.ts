import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("get operation", () => {
  let repoStatement;
  let repoUser;
  let useCase: GetStatementOperationUseCase;
  let statementUseCase: CreateStatementUseCase;
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

    useCase = new GetStatementOperationUseCase(repoUser, repoStatement);
    statementUseCase = new CreateStatementUseCase(repoUser, repoStatement);
    userUseCase = new CreateUserUseCase(repoUser);
  });

  it("success get operation", async () => {
    const user = await userUseCase.execute(userData);

    statementData.user_id = user.id!;

    const statement = await statementUseCase.execute(statementData);
    const operation = await useCase.execute({
      statement_id: statement.id!,
      user_id: user.id!
    });

    expect(operation).not.toBeNull();
    expect(operation).toHaveProperty("id");
    expect(operation.user_id).toBe(user.id!);
  });

  it("user not found", async () => {
    expect(async () =>
      await useCase.execute({
        statement_id: '123',
        user_id: '123'
      })
    )
      .rejects
      .toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("statement not found", async () => {
    expect(async () => {
      const user = await userUseCase.execute(userData);

      await useCase.execute({
        statement_id: '123',
        user_id: user.id!
      })
    })
      .rejects
      .toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})
