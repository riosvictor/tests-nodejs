import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  setupFiles: ["<rootDir>/test/setup-tests.ts"],
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/modules/**/useCases/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
};

export default config
