const config = require("./jest.config")

module.exports = {
  ...config,
  "testEnvironment": "jest-bench/environment",
  "reporters": ["default", "jest-bench/reporter"],
  "testRegex": "(./__benchmarks__/.*\\.)bench\\.ts$"
}
