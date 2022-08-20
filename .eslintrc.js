module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "google", "prettier"],
  plugins: ["prettier"],
  ignorePatterns: ["**/node_modules/*", "**/build/*", "*.min.js"],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
  },
};
