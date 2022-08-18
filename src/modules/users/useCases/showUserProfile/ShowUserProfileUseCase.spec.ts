import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("profile user", () => {
  let repo;
  let useCase: ShowUserProfileUseCase;
  let userUseCase: CreateUserUseCase;

  const userData = {
    name: "John Doe",
    email: "john@email.com",
    password: "123456"
  };

  beforeEach(() => {
    repo = new InMemoryUsersRepository();
    useCase = new ShowUserProfileUseCase(repo);
    userUseCase = new CreateUserUseCase(repo);
  });

  it("success creation", async () => {
    const user = await userUseCase.execute(userData);
    const foundedUser = await useCase.execute(user.id!);

    expect(foundedUser).not.toBeNull();
  });

  it("user email already exists", async () => {
    expect(async () => await useCase.execute('1'))
      .rejects
      .toBeInstanceOf(ShowUserProfileError);
  });
})
