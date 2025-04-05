// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Fix for React 18 act() warnings
// https://github.com/testing-library/react-testing-library/issues/992
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock timers
// This helps with any setTimeout or setInterval in tests
jest.useFakeTimers();

// Mock environment variables
window.ENV = {
  VITE_API_URL: 'http://localhost:8000'
};

// Increase test timeout for all tests
jest.setTimeout(15000);

// Suppress React 18 console errors about act()
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};