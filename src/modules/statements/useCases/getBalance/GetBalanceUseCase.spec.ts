import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("get balance", () => {
  let repoStatement;
  let repoUser;
  let useCase: GetBalanceUseCase;
  let userUseCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  beforeEach(() => {
    repoStatement = new InMemoryStatementsRepository();
    repoUser = new InMemoryUsersRepository();

    useCase = new GetBalanceUseCase(repoStatement, repoUser);
    userUseCase = new CreateUserUseCase(repoUser);
  });

  it("success get value", async () => {
    const user = await userUseCase.execute(userData);
    const response = await useCase.execute({user_id: user.id!});

    expect(response).not.toBeNull();
    expect(response.balance).toBe(0);
    expect(response.statement).toHaveLength(0);
  });

  it("user not found", async () => {
    expect(async () => await useCase.execute({user_id: '123'}))
      .rejects
      .toBeInstanceOf(GetBalanceError);
  });
})
