module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js"
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  testTimeout: 15000,
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50
    }
  },
  maxWorkers: '50%'
};