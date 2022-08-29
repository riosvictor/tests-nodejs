import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

describe("make deposit, withdraw or transfer", () => {
  let repoStatement;
  let repoUser;
  let useCase: CreateStatementUseCase;
  let userUseCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  beforeEach(() => {
    repoStatement = new InMemoryStatementsRepository();
    repoUser = new InMemoryUsersRepository();

    useCase = new CreateStatementUseCase(repoUser, repoStatement);
    userUseCase = new CreateUserUseCase(repoUser);
  });

  it("success insert value", async () => {
    const user = await userUseCase.execute(userData);

    const statement = await useCase.execute({
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'deposit',
      user_id: user.id!,
    });

    expect(statement).not.toBeNull();
    expect(statement).toHaveProperty("id");
  });

  it("success remove value", async () => {
    const user = await userUseCase.execute(userData);

    await useCase.execute({
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'deposit',
      user_id: user.id!,
    });

    const statement = await useCase.execute({
      amount: 100,
      type: OperationType.WITHDRAW,
      description: 'withdraw',
      user_id: user.id!,
    });

    expect(statement).not.toBeNull();
    expect(statement).toHaveProperty("id");
  });

  it("user not found", async () => {
    await expect(useCase.execute({
      amount: 100,
      type: OperationType.WITHDRAW,
      description: 'withdraw',
      user_id: '123',
    }))
      .rejects
      .toEqual(new CreateStatementError.UserNotFound());
  });

  it("withdraw insufficient founds", async () => {
    await expect(async () => {
      const user = await userUseCase.execute(userData);

      await useCase.execute({
        amount: 50,
        description: 'deposit',
        type: OperationType.DEPOSIT,
        user_id: user.id!,
      });

      await useCase.execute({
        amount: 100,
        description: 'withdraw',
        type: OperationType.WITHDRAW,
        user_id: user.id!,
      });
    })
      .rejects
      .toEqual(new CreateStatementError.InsufficientFunds());
  });

  it("success transfer value", async () => {
    const user = await userUseCase.execute(userData);
    const receiver = await userUseCase.execute({
      ...userData,
      email: 'batatinha@gmail.com',
    });

    await useCase.execute({
      amount: 100,
      description: 'deposit',
      type: OperationType.DEPOSIT,
      user_id: user.id!,
    });

    const statement = await useCase.execute({
      amount: 50,
      description: 'transfer',
      type: OperationType.TRANSFER,
      user_id: user.id!,
      receiver_user_id: receiver.id!,
    });

    expect(statement).not.toBeNull();
    expect(statement).toHaveProperty("id");
  });

  it("transfer insufficient found", async () => {
    await expect(async () => {
      const user = await userUseCase.execute(userData);
      const receiver = await userUseCase.execute({
        ...userData,
        email: 'batatinha@gmail.com',
      });

      await useCase.execute({
        amount: 50,
        description: 'deposit',
        type: OperationType.DEPOSIT,
        user_id: user.id!,
      });

      await useCase.execute({
        amount: 100,
        description: 'transfer',
        type: OperationType.TRANSFER,
        user_id: user.id!,
        receiver_user_id: receiver.id!,
      });
    })
      .rejects
      .toEqual(new CreateStatementError.InsufficientFunds());
  });
})
