import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  setupFiles: ["<rootDir>/test/setup-tests.ts"],
}

export default config
