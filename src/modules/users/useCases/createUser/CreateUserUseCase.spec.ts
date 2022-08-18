import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("create user", () => {
  let repo;
  let useCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  beforeEach(() => {
    repo = new InMemoryUsersRepository();
    useCase = new CreateUserUseCase(repo);
  });

  it("success creation", async () => {
    const user = await useCase.execute(userData);

    expect(user).toHaveProperty("id");
  });

  it("user email already exists", async () => {
    await useCase.execute(userData);

    expect(async () => await useCase.execute(userData))
      .rejects
      .toBeInstanceOf(CreateUserError);
  });
})
