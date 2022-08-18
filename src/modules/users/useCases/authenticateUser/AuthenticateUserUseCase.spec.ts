import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("authenticate user", () => {
  let repo;
  let useCase: AuthenticateUserUseCase;
  let userUseCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  beforeEach(() => {
    repo = new InMemoryUsersRepository();
    useCase = new AuthenticateUserUseCase(repo);
    userUseCase = new CreateUserUseCase(repo);
  });

  it("success authentication", async () => {
    await userUseCase.execute(userData);
    const auth = await useCase.execute(userData);

    expect(auth).toHaveProperty("token");
  });

  it("not found email", async () => {
    expect(async () => {
      await useCase.execute({
        ...userData,
        email: "batatinha@email.com"
      })
    })
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("password is wrong", async () => {
    await userUseCase.execute(userData);

    expect(async () => {
      await useCase.execute({
        ...userData,
        password: "banana"
      })
    })
      .rejects
      .toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})
