module.exports = {
  // Sets the test environment to a browser like environment (jsdom)
  testEnvironment: 'jsdom',
  
  // Tells Jest to use ts-jest for any .ts or .tsx files
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },

  // By default, Jest ignores node_modules. We need to make exceptions for
  // packages that are published as pure ES Modules.
  transformIgnorePatterns: [
    '/node_modules/(?!(lodash-es|antd|@ant-design|rc-.+?|@babel/runtime))/',
  ],

  // Mocks CSS imports so they don't cause errors during tests
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', 
    '@testing-library/jest-dom'
  ],
};
