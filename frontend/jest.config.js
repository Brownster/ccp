module.exports = {
  // Handle ES modules
  transformIgnorePatterns: [
    "node_modules/(?!(.*(react-syntax-highlighter|refractor))/)"
  ],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/empty-module.js"
  },
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js",
    "<rootDir>/jest.setup.js"
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      statements: 10,
      branches: 5,
      functions: 5,
      lines: 10
    }
  },
  maxWorkers: '50%'
};