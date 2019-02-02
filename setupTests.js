/**
 * Simplify mocks clear after each test suite
 */
afterEach(() => {
  jest.clearAllMocks().restoreAllMocks();
});
