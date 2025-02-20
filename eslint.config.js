// eslint.config.js
module.exports = [
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        "no-unused-vars": "warn",
        "semi": ["error", "always"],
      },
    },
  ];